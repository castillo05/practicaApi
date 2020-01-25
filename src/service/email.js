'use strict'
import nodemailer from 'nodemailer';
import {config} from 'dotenv';
config()

const {USER_EMAIL, PASSWORD_EMAIL}=process.env;

const mailer = async ({
    to
})=>{
    try {

        
        let transport = nodemailer.createTransport({
            service:'Gmail',
            secure:false,
            auth:{
                user:USER_EMAIL,
                pass:PASSWORD_EMAIL
            },
            tls:{
                rejectUnauthorized:true
            }
        })

        let mailOption= {
            from:USER_EMAIL,
            to:to,
            subject:'',
            cc:'',
            html:'<h1>Hola JC Developer</h1>'
        }

        // verify connection configuration
       await transport.verify(function(error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Server is ready to take our messages');
            }
        });

        await transport.sendMail(mailOption,(error,info)=>{
            if (error) {
                console.log(error);
               
            }else{
                console.log("Email sent");
                console.log('Message sent: %s', info.messageId)

            }
        })

        
        // console.log('Preview URL: %s', email.getTestMessageUrl(info))
    } catch (error) {
        console.log(error);
    }
}

export default mailer;