'use strict'

import mongoose, { Schema } from 'mongoose';
import Joi from '@hapi/joi';
import database from '../db_connection';

database

const User = new mongoose.Schema({
    firstName:{
        required:true,
        type:String
    },
    lastName:{
        required:true,
        type:String
    },
    email:{
        required:true,
        lowercase:true,
        type:String
    },
    password:{
        required:true,
        type:String
    },
    password_repeat:{
        required:true,
        type:String
    }
},{
    timestamps:true
})

const UserValidate = Joi.object().keys({
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    email: Joi.string().email({minDomainSegments:2}).required(),
    password:Joi.string().required().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).error(new Error('La contraseña debe tener almenos una mayuscula, una minuscula, un numero, un caracter especial y 8 caracteres de longitud')),
    password_repeat:Joi.ref('password')
});


const passwordValidate=Joi.object().keys({
    password_old:Joi.string().required(),
    password:Joi.string().required().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).error(new Error('La contraseña debe tener almenos una mayuscula, una minuscula, un numero, un caracter especial y 8 caracteres de longitud')),
    password_repeat:Joi.ref('password')
    
})

export default {
    model: database.model('User', User),
    validation: UserValidate,
    passwordValidation: passwordValidate
}