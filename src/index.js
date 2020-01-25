import database from './db_connection';
import {config} from 'dotenv';
import app from './app';


config()

const {PORT}=process.env;

(async()=>{
    try {
        await database

        console.log('Connect to database');
        app.listen(PORT,()=>{
            console.log(`App listen to port ${PORT}`);
        });


    } catch (error) {
        console.log(error);
    }
})()