'use strict'

import models from '../models';
import express from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import {config} from 'dotenv';
import mailer from '../service/email';

config()

const {PRIVATEKEYTOKEN}=process.env;

const {User:{model,validation}}=models;
const User=model;
const UserValidation=validation;
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
                })