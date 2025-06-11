import { ObjectId } from 'mongodb'
import { db } from './../db/mongoClient.js'
import Boom from '@hapi/boom'
import { sendMail } from '../utils/sendMail.js'
import path from 'path'
import jwt from 'jsonwebtoken'
import config from '../config.js'
class Services{
  constructor(){
    this.stages={
      os:'isOs',
      physicalConditions:'isConditions',
      notification:'isNotification',
      calibration:'isCalibration',
      send:'isSend'
    }
    this.logo='encabezado'
  }
  async create(data){
    try {
      const result = await db.collection('services').insertOne(data)
      return result
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }else{
      throw Boom.badImplementation('Algo falto aqui para subir',error)}
    }
  }
  async getServices({service,year}){
    console.log(year)
    try {
      const query = { year }
      if(service !== 'all'){
        query.service=service
      }
      const result = await db.collection('services').find(query).toArray()

      return result
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }else{
      throw Boom.badImplementation('Algo falto aqui para subir',error)}
    }
  }
 async updateServices(data) {
  const { equipmentList, dataEntry, stage } = data;
  const equipmentIds = equipmentList.map(item => new ObjectId(item));
  let isOs = !dataEntry.os.isPhysicalOs;
  const newStage = this.stages[stage];

  const newData = {
    [stage]: { ...dataEntry },
    isOs,
    stage: newStage
  };

  try {
    const result = await db
      .collection('services')
      .updateMany(
        { _id: { $in: equipmentIds } },
        { $set: { ...newData } }
      );

    console.log('Documentos actualizados:', result);

    if (result.modifiedCount > 0) {
      const resultOs = await db
        .collection('serviceOrders')
        .updateOne(
          { os: dataEntry.os },
          { $addToSet: { equipmentList: { $each: equipmentList } } },
          { upsert: true }
        );

      console.log("Resultado updateOne:", resultOs);

      return { resultOs, mod: result.modifiedCount };
    }

  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    } else {
      throw Boom.badImplementation('Algo falló al subir', error);
    }
  }
}

  async osRecived({ id },data){
    const _id = new ObjectId(id)

    try {
      await db.collection('services').updateOne(
        {_id},
        {$set:{
          isOs:true,
          'os.fechaObjetivo':data.fechaObjetivo,
          'os.userRecived':data.userRecived,
          'os.dateRecived':data.dateRecived
        }}
      )
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }else{
      throw Boom.badImplementation('Algo falto aqui para subir',error)}
    }
  }
  async updateConditions(files, data){
    try {
    console.log(data)

      let { equipmentList, dataEntry,stage} = data
      equipmentList=JSON.parse(equipmentList)
      dataEntry = JSON.parse(dataEntry)
      const equipmentIds = equipmentList.map(item=> new ObjectId(item))
      const newStage=this.stages[stage]
      const newData ={
        [stage]:{...dataEntry,images:files},
        [newStage]:true,

      }
      const result = await db
      .collection('services')
      .updateMany(
        {_id:{$in:equipmentIds}},
        {$set:{...newData}}
      )

      return result


    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }else{
      throw Boom.badImplementation('Algo falto aqui para subir',error)}
    }
  }
  async notifyClientOfReception(data){
    const { name, email, dateRecived,comments,os} = data
    try {

      const token = jwt.sign(
        {os,email},
        config.jwtSecret,
        {expiresIn:'30d'}
      )

      const link = `${config.appUrl}/service/?token_service=${token}`
      console.log(link)

      const result = await sendMail({
              to:email,
              subject:'Notificación de recepción de equipo',
              data:{name,dateRecived,comments,link},
              templateEmail:'notifyClient',
              attachments:[{
                filename:this.logo,
                path:path.join(`emails/${this.logo}.png`),
                cid:'logo_empresa'
              }]
       })

       if(result.success){
        const orderList = await this.getEquipmentsByOs(os)
        const idList = orderList.map(item=>new ObjectId(item))
        await db.collection('services')
        .updateMany(
          {_id:{ $in:idList }},
          {$set:{isNotification:true}}
        )
       }




      return result
    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al ENVIAR NOTIFICACIÓN',error)
    }
  }
  async getEquipmentsByOs(os){
    const order = await db.collection('serviceOrders')
    .findOne({
      os:os
    })

    return order.equipmentList
  }
  async getServiceByOs({token}){
    const decoded = jwt.verify(token,config.jwtSecret)
    const order = decoded.os
    try {
      const list = await this.getEquipmentsByOs(order)

      const idEquipments = list.map(item =>new ObjectId(item))
      const data = await db.collection('services').find({
        _id:{ $in: idEquipments}
      }).toArray()


    return data

    } catch (error) {
      if(Boom.isBoom(error)){
        throw error
      }
      throw Boom.badImplementation('Error al ENVIAR NOTIFICACIÓN',error)
    }


  }


}

export default Services
