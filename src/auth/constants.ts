import * as dotenv from 'dotenv'
dotenv.config()

export const envConstants = {
    secret: `${process.env.SECRET_KEY}`,    
    env: `${process.env.ENV}`
}  satisfies Record<string,string>
