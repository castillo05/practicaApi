'use starict'

import mongoose from 'mongoose';
import {config} from 'dotenv';

config()

const {DB_USER, DB_PASSWORD, DB_URI}=process.env;

export default mongoose.createConnection(`mongodb+srv://${DB_USER}:${DB_PASSWORD}${DB_URI}`,{useUnifiedTopology:true, useNewUrlParser:true});