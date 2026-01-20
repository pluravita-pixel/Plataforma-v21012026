"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, X, Download, Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadSessionFile } from "@/app/actions/files";
import { format } from "date-fns";

interface FileUploaderProps {
    appointmentId: string;
    uploaderId: string;
    existingFiles?: any[];
    readOnly?: boolean;
}

export function FileUploader({ appointmentId, uploaderId, existingFiles = [], readOnly = false }: FileUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("El archivo no puede superar los 2MB.");
            return;
        }

        const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Solo se permiten archivos PDF, Texto o Imágenes.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("appointmentId", appointmentId);
        formData.append("uploaderId", uploaderId);

        const result = await uploadSessionFile(appointmentId, formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Archivo subido correctamente");
        }
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-[#4A3C31] flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Archivos de la Sesión
                </h4>
                {!readOnly && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#A68363] hover:bg-[#A68363]/10 h-8 text-xs font-bold"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <UploadCloud className="h-3 w-3 mr-1" />}
                        Subir archivo
                    </Button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                />
            </div>

            {/* File List */}
            <div className="space-y-2">
                {existingFiles.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">No hay archivos compartidos para esta sesión.</p>
                ) : (
                    existingFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#A68363]/30 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#A68363] border border-gray-100 shrink-0">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{file.fileName}</p>
                                    <p className="text-[10px] text-gray-400">
                                        Subido por {file.uploader?.fullName || 'Usuario'} • {format(new Date(file.createdAt), "d MMM, HH:mm")}
                                    </p>
                                </div>
                            </div>
                            {file.signedUrl && (
                                <a
                                    href={file.signedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-[#A68363] hover:bg-white rounded-lg transition-all"
                                    title="Descargar"
                                >
                                    <Download className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
