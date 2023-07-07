const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const path = require('path');

module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Shivam Gupta <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){

        return nodemailer.createTransport({
            // service: 'Gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }


    async send (template,subject) {

        const html = pug.renderFile( path.join(__dirname,`../views/emails/${template}.pug`),{
            firstName: this.firstName,
            url: this.url,
            subject
        });
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html,
            text: htmlToText(html)
        };
    
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome','Welcome to the Techspark Family');
    }

    async sendPasswordReset(){
        await this.send('passwordReset','Your password reset token (valid for only 10 minutes)');
    }
};

