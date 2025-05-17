import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
import config from './../config.js'

const sendMail = async({from,to,subject,data,templateEmail,attachments=[]})=>{

  const transporter = nodemailer.createTransport({
    host:config.hostEmailSupport,
    port:config.portEmailSupport,
    secure:false,//Este es falso para puesto 587 y true para puerto 465
    auth:{
      user:config.emailSupport,
      pass:config.passSupport
    }
  })

  transporter.use('compile',hbs({
    viewEngine:{
      extname:'.hbs',
      partialsDir:path.resolve('./emails'),
      defaultLayout:false
    },
    viewPath:path.resolve('./emails'),
    extName:'.hbs'
  }))

  try {
    const sendedEmail = await transporter.sendMail({
      from,
      to,
      subject,
      template:templateEmail,
      context:data,
      attachments
    })
    console.log('Respuesta del envio de mail',sendedEmail)

  } catch (error) {
    console.error(error)
  }
}

export { sendMail }
