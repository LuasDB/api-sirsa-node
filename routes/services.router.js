import express from 'express';
import Services from './../services/services.service.js'
import uploadFiles from './../middlewares/multer-upload-files.js'
import Boom from '@hapi/boom';


const router = express.Router();
const services = new Services()

const servicesRouter = (io)=>{

  router.post('/', async(req, res,next) => {

    try {
      const newService = await services.create(req.body)

      res.status(200).json({
        success:true,
        message:'Registro creado exitosamente',
        data:newService
      })
    } catch (error) {
      next(error)
    }
  })

  router.get('/', async(req, res,next) => {

    try {
      const getServices = await services.getServices(req.query)

      res.status(200).json({
        success:true,
        data:getServices
      })
    } catch (error) {
      next(error)
    }
  })

  router.get('/by-os/', async(req, res,next) => {
    try {
      const getServices = await services.getServiceByOs(req.query)

      res.status(200).json({
        success:true,
        data:getServices
      })
    } catch (error) {
      next(error)
    }
  })

  router.patch('/', async(req, res,next) => {

    try {
      const updateServices = await services.updateServices(req.body)
      console.log('RES',updateServices)
      res.status(200).json({
        success:true,
        message:'Registros actualizados con éxito',
        data:updateServices
      })
    } catch (error) {
      next(error)
    }
  })

  router.patch('/os-recived/:id', async(req, res,next) => {

    try {
      const osRecived = await services.osRecived(req.params,req.body)
      res.status(200).json({
        success:true,
        message:'Registros actualizados con éxito',
        data:osRecived
      })
    } catch (error) {
      next(error)
    }
  })

  router.patch('/update-conditions/:collection',uploadFiles,async(req,res,next)=>{
    const uploadMiddlewere = req.upload.any()

    uploadMiddlewere(req,res,async(err)=>{
      if(err){
        next(error)
      }
      try {
        const { files,body } = req
        const updateConditions = await services.updateConditions(files,body)
        res.status(200).json({
          success:true,
          message:'Registros actualizados con éxito',
          data:updateConditions
        })
      } catch (error) {
        next(error)
      }


    })
  })

  router.post('/notify-client', async(req, res,next) => {

    try {
      const notifyClient = await services.notifyClientOfReception(req.body)

      res.status(200).json({
        success:true,
        message:'Enviado correctamente',
        data:notifyClient
      })
    } catch (error) {
      next(error)
    }
  })







  return router
}

export default servicesRouter
