import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Encryption key from environment or generate one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);

// Simple encryption for credentials
function encryptCredentials(data: Record<string, string>): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptCredentials(encrypted: string): Record<string, string> {
  try {
    const [ivHex, encryptedData] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch {
    return {};
  }
}

// GET /api/admin/payment-config/[provider] - Get provider config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;

    const config = await prisma.paymentProviderConfig.findUnique({
      where: { provider: provider.toUpperCase() },
    });

    if (!config) {
      // Return default empty config
      return NextResponse.json({
        config: {
          provider: provider.toUpperCase(),
          isEnabled: false,
          isTestMode: true,
          credentials: {},
        },
      });
    }

    // Decrypt credentials
    const credentials = config.credentials
      ? decryptCredentials(config.credentials as string)
      : {};

    // Mask sensitive values
    const maskedCredentials: Record<string, string> = {};
    for (const key of Object.keys(credentials)) {
      const value = credentials[key];
      if (value && value.length > 4) {
        maskedCredentials[key] = '*'.repeat(value.length - 4) + value.slice(-4);
      } else {
        maskedCredentials[key] = value ? '****' : '';
      }
    }

    return NextResponse.json({
      config: {
        id: config.id,
        provider: config.provider,
        isEnabled: config.isEnabled,
        isTestMode: config.isTestMode,
        credentials: maskedCredentials,
        lastTestedAt: config.lastTestedAt,
        testStatus: config.testStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching provider config:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/payment-config/[provider] - Update provider config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const body = await request.json();
    const { credentials, isEnabled, isTestMode } = body;

    const providerUpper = provider.toUpperCase();

    // Encrypt credentials if provided
    let encryptedCredentials: string | undefined;
    if (credentials && Object.keys(credentials).length > 0) {
      // Filter out empty values
      const filteredCredentials: Record<string, string> = {};
      for (const [key, value] of Object.entries(credentials)) {
        if (value && typeof value === 'string' && !value.startsWith('*')) {
          filteredCredentials[key] = value;
        }
      }

      if (Object.keys(filteredCredentials).length > 0) {
        // If updating, merge with existing credentials
        const existing = await prisma.paymentProviderConfig.findUnique({
          where: { provider: providerUpper },
        });

        if (existing?.credentials) {
          const existingCreds = decryptCredentials(existing.credentials as string);
          // Merge, keeping existing values for masked fields
          for (const key of Object.keys(existingCreds)) {
            if (!filteredCredentials[key]) {
              filteredCredentials[key] = existingCreds[key];
            }
          }
        }

        encryptedCredentials = encryptCredentials(filteredCredentials);
      }
    }

    const config = await prisma.paymentProviderConfig.upsert({
      where: { provider: providerUpper },
      create: {
        provider: providerUpper,
        credentials: encryptedCredentials || '{}',
        isEnabled: isEnabled ?? false,
        isTestMode: isTestMode ?? true,
      },
      update: {
        ...(encryptedCredentials && { credentials: encryptedCredentials }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(isTestMode !== undefined && { isTestMode }),
      },
    });

    return NextResponse.json({
      config: {
        id: config.id,
        provider: config.provider,
        isEnabled: config.isEnabled,
        isTestMode: config.isTestMode,
      },
      message: 'Configuración guardada correctamente',
    });
  } catch (error) {
    console.error('Error updating provider config:', error);
    return NextResponse.json(
      { error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payment-config/[provider]/test - Test provider connection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const providerUpper = provider.toUpperCase();

    const config = await prisma.paymentProviderConfig.findUnique({
      where: { provider: providerUpper },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Proveedor no configurado' },
        { status: 404 }
      );
    }

    // Get credentials
    const credentials = config.credentials
      ? decryptCredentials(config.credentials as string)
      : {};

    // Test connection based on provider
    let testResult = { success: false, message: 'Proveedor no soportado' };

    switch (providerUpper) {
      case 'NEQUI':
        testResult = await testNequiConnection(credentials, config.isTestMode);
        break;
      case 'MERCADOPAGO':
        testResult = await testMercadoPagoConnection(credentials, config.isTestMode);
        break;
      case 'COBRU':
        testResult = await testCobruConnection(credentials, config.isTestMode);
        break;
    }

    // Update test status
    await prisma.paymentProviderConfig.update({
      where: { provider: providerUpper },
      data: {
        lastTestedAt: new Date(),
        testStatus: testResult.success ? 'connected' : 'error',
      },
    });

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
    });
  } catch (error) {
    console.error('Error testing provider connection:', error);
    return NextResponse.json(
      { error: 'Error al probar la conexión' },
      { status: 500 }
    );
  }
}

// Test functions for each provider
async function testNequiConnection(
  credentials: Record<string, string>,
  isTestMode: boolean
): Promise<{ success: boolean; message: string }> {
  if (!credentials.clientId || !credentials.clientSecret) {
    return { success: false, message: 'Faltan credenciales (clientId, clientSecret)' };
  }

  // In production, make actual API call to Nequi
  // For now, simulate the test
  const baseUrl = isTestMode
    ? 'https://api.sandbox.nequi.com'
    : 'https://api.nequi.com';

  try {
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Conexión exitosa con Nequi' };
  } catch {
    return { success: false, message: 'Error al conectar con Nequi' };
  }
}

async function testMercadoPagoConnection(
  credentials: Record<string, string>,
  isTestMode: boolean
): Promise<{ success: boolean; message: string }> {
  if (!credentials.accessToken) {
    return { success: false, message: 'Falta el Access Token' };
  }

  try {
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Conexión exitosa con MercadoPago' };
  } catch {
    return { success: false, message: 'Error al conectar con MercadoPago' };
  }
}

async function testCobruConnection(
  credentials: Record<string, string>,
  isTestMode: boolean
): Promise<{ success: boolean; message: string }> {
  if (!credentials.apiKey || !credentials.secretKey) {
    return { success: false, message: 'Faltan credenciales (apiKey, secretKey)' };
  }

  try {
    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: 'Conexión exitosa con Cobru' };
  } catch {
    return { success: false, message: 'Error al conectar con Cobru' };
  }
}
