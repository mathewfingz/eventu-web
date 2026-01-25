'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
    Upload,
    Image as ImageIcon,
    X,
    Trash2,
    Star,
    Video,
    Link as LinkIcon,
    Save,
    Loader2,
    Check,
    AlertCircle
} from 'lucide-react';

interface ImageItem {
    id: string;
    url: string;
    type: 'poster' | 'cover' | 'gallery';
    name: string;
}

// Mock data
const mockImages: ImageItem[] = [
    {
        id: '1',
        url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
        type: 'poster',
        name: 'poster-evento.jpg'
    },
    {
        id: '2',
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
        type: 'cover',
        name: 'cover-evento.jpg'
    },
    {
        id: '3',
        url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        type: 'gallery',
        name: 'galeria-1.jpg'
    },
    {
        id: '4',
        url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
        type: 'gallery',
        name: 'galeria-2.jpg'
    }
];

interface UploadAreaProps {
    label: string;
    description: string;
    currentImage?: ImageItem;
    onUpload: (file: File) => void;
    onRemove?: () => void;
    aspectRatio?: string;
}

function UploadArea({ label, description, currentImage, onUpload, onRemove, aspectRatio = '16/9' }: UploadAreaProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleUpload(file);
        }
    }, []);

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        onUpload(file);
        setIsUploading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <p className="text-xs text-gray-500 mb-3">{description}</p>

            {currentImage ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 group" style={{ aspectRatio }}>
                    <img
                        src={currentImage.url}
                        alt={label}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="p-3 bg-white rounded-full cursor-pointer hover:bg-gray-100">
                            <Upload className="w-5 h-5 text-gray-700" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                        {onRemove && (
                            <button
                                onClick={onRemove}
                                className="p-3 bg-white rounded-full hover:bg-gray-100"
                            >
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </button>
                        )}
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs">
                        {currentImage.name}
                    </div>
                </div>
            ) : (
                <label
                    className={`block cursor-pointer rounded-xl border-2 border-dashed transition-colors ${
                        isDragging
                            ? 'border-[#E53935] bg-[#E53935]/5'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ aspectRatio }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center h-full p-6">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-10 h-10 text-[#E53935] animate-spin mb-3" />
                                <span className="text-sm text-gray-600">Subiendo imagen...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    Arrastra una imagen o haz clic
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    PNG, JPG hasta 5MB
                                </span>
                            </>
                        )}
                    </div>
                </label>
            )}
        </div>
    );
}

export default function EventImagesPage() {
    const params = useParams();
    const eventId = params?.eventId as string;

    const [images, setImages] = useState<ImageItem[]>(mockImages);
    const [videoUrl, setVideoUrl] = useState('https://youtube.com/watch?v=abc123');
    const [isSaving, setIsSaving] = useState(false);

    const posterImage = images.find(img => img.type === 'poster');
    const coverImage = images.find(img => img.type === 'cover');
    const galleryImages = images.filter(img => img.type === 'gallery');

    const handleUpload = (file: File, type: 'poster' | 'cover' | 'gallery') => {
        const newImage: ImageItem = {
            id: String(Date.now()),
            url: URL.createObjectURL(file),
            type,
            name: file.name
        };

        if (type === 'poster' || type === 'cover') {
            setImages(images.filter(img => img.type !== type).concat(newImage));
        } else {
            setImages([...images, newImage]);
        }
    };

    const handleRemove = (id: string) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Call API to save images
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Imagenes del Evento</h1>
                    <p className="text-gray-600">
                        Sube las imagenes y videos del evento
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Guardar cambios
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Images */}
                <div className="space-y-6">
                    {/* Poster */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <h2 className="font-semibold text-gray-900">Imagen Principal (Poster)</h2>
                        </div>
                        <UploadArea
                            label=""
                            description="Esta imagen se muestra en la lista de eventos. Recomendado: 400x600px"
                            currentImage={posterImage}
                            onUpload={(file) => handleUpload(file, 'poster')}
                            onRemove={posterImage ? () => handleRemove(posterImage.id) : undefined}
                            aspectRatio="2/3"
                        />
                    </div>

                    {/* Cover */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                            <h2 className="font-semibold text-gray-900">Imagen de Portada (Cover)</h2>
                        </div>
                        <UploadArea
                            label=""
                            description="Banner horizontal para la pagina del evento. Recomendado: 1200x400px"
                            currentImage={coverImage}
                            onUpload={(file) => handleUpload(file, 'cover')}
                            onRemove={coverImage ? () => handleRemove(coverImage.id) : undefined}
                            aspectRatio="3/1"
                        />
                    </div>
                </div>

                {/* Gallery and Video */}
                <div className="space-y-6">
                    {/* Video URL */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Video className="w-5 h-5 text-red-500" />
                            <h2 className="font-semibold text-gray-900">Video del Evento</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                            Agrega un enlace de YouTube o Vimeo
                        </p>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                />
                            </div>
                            {videoUrl && (
                                <button
                                    onClick={() => setVideoUrl('')}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {videoUrl && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700">Video configurado correctamente</span>
                            </div>
                        )}
                    </div>

                    {/* Gallery */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-purple-500" />
                                <h2 className="font-semibold text-gray-900">Galeria de Imagenes</h2>
                            </div>
                            <span className="text-sm text-gray-500">{galleryImages.length} imagenes</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {galleryImages.map((img) => (
                                <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-video">
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => handleRemove(img.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 p-6 text-center transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                        Array.from(files).forEach(file => handleUpload(file, 'gallery'));
                                    }
                                }}
                                className="hidden"
                            />
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-600">
                                Agregar mas imagenes a la galeria
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-800">Recomendaciones para imagenes</h4>
                        <ul className="text-sm text-blue-700 mt-1 space-y-1">
                            <li>• Usa imagenes de alta calidad (minimo 1080p)</li>
                            <li>• El poster es la imagen principal que veran los usuarios</li>
                            <li>• La portada se muestra en la parte superior de la pagina del evento</li>
                            <li>• Evita texto en las imagenes, usa la descripcion del evento</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
