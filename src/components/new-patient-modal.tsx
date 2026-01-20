"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createUser } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const userSchema = z.object({
    fullName: z.string().min(2, "Nombre demasiado corto"),
    email: z.string().email("Email inválido"),
});

type UserFormValues = z.infer<typeof userSchema>;

export function NewPatientModal() {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: { fullName: "", email: "" },
    });

    async function onSubmit(data: UserFormValues) {
        const result = await createUser(data);
        if (result.success) {
            toast.success("Usuario creado correctamente");
            setIsOpen(false);
            form.reset();
        } else {
            toast.error(result.error || "Error al crear usuario");
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Paciente
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Paciente</DialogTitle>
                    <DialogDescription>
                        Completa los datos para registrar un nuevo usuario en la plataforma.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre Completo</label>
                        <Input {...form.register("fullName")} placeholder="Ej. Juan Pérez" />
                        {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Correo Electrónico</label>
                        <Input {...form.register("email")} type="email" placeholder="juan@ejemplo.com" />
                        {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Guardando..." : "Crear Usuario"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

