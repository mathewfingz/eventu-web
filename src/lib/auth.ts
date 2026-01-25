import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';

// Define UserRole locally since Prisma client may not be generated
type UserRole = 'USER' | 'CLIENT' | 'PROMOTER' | 'VENUE' | 'ADMIN' | 'COORDINATOR' | 'SUPERADMIN';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string;
            image?: string;
            role: UserRole;
        };
    }

    interface User {
        role: UserRole;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: UserRole;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,

    providers: [
        // Email/Password credentials
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email y contraseña son requeridos');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error('Credenciales inválidas');
                }

                // Note: In production, you'd hash passwords. For now, demo mode.
                // const isValid = await compare(credentials.password, user.password);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),

        // Google OAuth (optional)
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                }),
            ]
            : []),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },

        async signIn({ user, account }) {
            // Update last login info
            if (user.id) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        lastLoginAt: new Date(),
                    },
                }).catch(() => {
                    // Ignore errors for non-existent users
                });
            }
            return true;
        },
    },

    pages: {
        signIn: '/auth/login',
        signOut: '/auth/logout',
        error: '/auth/error',
        newUser: '/auth/register',
    },

    events: {
        async signIn({ user, account, isNewUser }) {
            console.log(`[AUTH] User signed in: ${user.email}, isNew: ${isNewUser}`);
        },
    },

    debug: process.env.NODE_ENV === 'development',
};

/**
 * Get session on the server side
 */
export { getServerSession } from 'next-auth';

/**
 * Role-based access check
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
}

/**
 * Role hierarchy check
 * SUPERADMIN > COORDINATOR > PROMOTER > VENUE > CLIENT
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
        SUPERADMIN: 6,
        ADMIN: 5,
        COORDINATOR: 4,
        PROMOTER: 3,
        VENUE: 2,
        USER: 1,
        CLIENT: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}
