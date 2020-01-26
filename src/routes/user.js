'use strict'

import models from '../models';
import express from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import {config} from 'dotenv';
import mailer from '../service/email';

config()

const {PRIVATEKEYTOKEN}=process.env;

const {User:{model,validation, passwordValidation}}=models;
const User=model;
const UserValidation=validation;
const passwordvalidate=passwordValidation;
const api=express.Router();

export default api
                .get('/user',async (req, res)=>{
                    try {
                        let users= await User.find().exec();

                        res.status(200).send({users:users});
                    } catch (error) {
                        console.log(error);
                    }
                }).post('/user/singup',async (req, res)=>{
                    try {
                       
                        let validate = UserValidation.validate(req.body);
                        if(validate.error){
                            res.status(500).send({message:validate.error.message})
                        }
                        let searchUser= User.find({email:req.body.email.toLowerCase()}).sort();
                        await searchUser.exec().then(user=>{
                            if(user.length>=1) return res.status(200).send({message:'Este email ya existe'});

                            if(!req.body.password) return res.status(200).send({message:'Introduzca la contraseña'});
                            bcrypt.hash(req.body.password,10).then((hash)=>{
                                if(hash){
                                    req.body.password=hash;
                                    let user = new User(req.body);
    
                                    user= user.save().then((user)=>{
                                        res.status(200).send({user:user});
                                       mailer({
                                            to:user.email
                                        })
                                    }).catch((error)=>{
                                        console.log(error);
                                    })
                                }else{
                                    res.status(200).send({message:'Contraseña Incorrecta'})
                                }
                            }).catch((error)=>{
                                console.log(error);
                            });
                         })

                    } catch (error) {
                        console.log(error);
                    }
                }).post('/user/singin', async(req, res)=>{
                    try {
                        let searchUser = User.findOne({email:req.body.email.toLowerCase()});

                        await searchUser.exec().then((user)=>{
                            console.log(user);
                            if(!user) return res.status(200).send({message:'No existe cuenta con este email'});
                            
                            if(!req.body.password) return res.status(200).send({message:'Introduzca la contraseña'});

                            bcrypt.compare(req.body.password,user.password).then((check)=>{
                                if(!check) return res.status(200).send({message:'Contraseña Incorrecta'});

                                if(req.body.gethash){
                                    let token = jsonwebtoken.sign({
                                        user:user
                                    },PRIVATEKEYTOKEN,{expiresIn:60*60});
                                    res.status(200).send({token:token});
                                }else{
                                    res.status(200).send({user:user});
                                }
                                
                            }).catch((error)=>{
                                console.log(error);
                            })
                        }).catch((error)=>{ 
                            console.log(error);
                        })
                    } catch (error) {
                        console.log(error);
                    }
                }).get('/user/:id', async (req, res)=>{
                    try {
                        let user = await User.findById(req.params.id);

                        if(!user){
                            return res.status(500).send({message:'Este usuario no existe'});
                        }
                        res.status(200).send({user:user});

                    } catch (error) {
                        console.log(error.message);
                        if(error.message){
                            return res.status(500).send({error:error.message, message:'Error al obtener usuario'});
                        }
                    }
                }).put('/user/:id', async (req, res)=>{
                    try {
                       
                        let update={
                            firstName:req.body.firstName,
                            lastName:req.body.lastName,
                            email:req.body.email,

                        }
                        let validate= await UserValidation.validate(update);
                        if(validate.error){
                           return res.status(500).send({message:validate.error.message})
                        }
                        let userUpdate= await User.findByIdAndUpdate(req.params.id,update);
                        
                        res.status(200).send({user:userUpdate});
                    } catch (error) {
                        console.log(error.message);
                        if(error.message){
                            return res.status(500).send({error:error.message, message:'Error al actualizar usuario'});
                        }
                    }
                }).put('/user/password-reset/:id', async (req, res)=>{
                    
                    try {
                        // Almacenamos los datos requeridos
                        let update={
                            password_old:req.body.password_old,
                            password:req.body.password,
                            password_repeat:req.body.password_repeat

                        }
                        // Validamos los campos
                        let validate=await passwordvalidate.validate(update);
                        // Si falla la validacion lanza mensaje de error
                        if(validate.error){
                        return res.status(500).send({message:validate.error.message})
                        
                        }
                        // Buscamos el usuario
                        let searchUser= await User.findById(req.params.id);
                        // Si el usuario es encontrado
                        if(searchUser){
                            // Compara la contraseña 
                            bcrypt.compare(req.body.password_old,searchUser.password,(err,result)=>{
                                if(err) return console.log(err);
                                // Si el password no coinciden lanza el mensaje
                                if(!result){
                                    res.status(200).send({message:'Su contraseña actual no coinciden'});
                                }else{
                                //    si coinciden encripta la nueva contraseña 
                                    bcrypt.hash(req.body.password,10).then(async(hash)=>{
                                        if(hash){
                                            let update={
                                                password:hash
                                            }
                                            // Busca de nuevo el usuario y guarda la nueva contrasenia
                                            let updatePassword = await User.findByIdAndUpdate(req.params.id,update);
                                            // Si guarda la nueva contrasenia con exito lanza el mensaje
                                            if(updatePassword) return res.status(200).send({message:'Contraseña modificada con exito'});
                                        } 
                                    }).catch((error)=>{
                                        console.log(error);
                                    })
                                }
                            })
                        }
                    } catch (error) {
                        console.log(error);
                    }   

                })