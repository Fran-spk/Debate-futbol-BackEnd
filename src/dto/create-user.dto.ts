import { IsEmail, IsNotEmpty, IsString, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"
import userModel from "../models/userModel";

@ValidatorConstraint({ async: true})
class isMailUnique implements ValidatorConstraintInterface{
    async validate(email: string) {
        const user = await userModel.findOne({ email });
        return !user;
    }
    defaultMessage = () => "El correo ya está en uso";
}

export class CreateUserDto{
    @IsString({ message: "El nombre debe ser un texto"})
    @IsNotEmpty({ message: "El nombre es obligatorio" })
    name!: string;

    @IsEmail({}, { message: "El correo no tiene un formato válido" })
    @IsNotEmpty({ message: "El nombre es obligatorio" })
    @Validate(isMailUnique)
    email!: string;

    @IsString({ message: "La contraseña debe ser un texto" })
    @IsNotEmpty({ message: "La contraseña es obligatoria" })
    password!: string;

    permissions: string[] = ["admin"];

}