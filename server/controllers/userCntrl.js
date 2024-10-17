import asyncHandler from 'express-async-handler'
import { prisma } from '../config/prismaConfig.js'


 export const createUser =asyncHandler (async(req, res) =>{
    console.log("creating a user");

    let {email} = req.body;
     const userExists = await prisma.user.findUnique({where: {email: email}})
     if(!userExists){
        const user = await prisma.user.create({data: req.body})
        res.send({
            message: "User registered successfully",
            user:user,
        });
     }
    else res.status(201).send({ message: "user already registered"});


});

//book a visit

 export const bookVisit = asyncHandler (async(req, res)=>{
    const {email, date} =req.body
    const{id} = req.params

    try{
        
        const alreadyBooked = await prisma.user.findUnique({
            where:{email},
            select:{bookedVisists: true}
        })

        if (alreadyBooked.bookedVisists.some((visit) => visit.id === id)){
            res.status(400).json({message: "this residency is already booked by you"})
        }
        else{
            await prisma.user.update({
                where: {email: email},
                data:{
                    bookedVisists: {push: {id, date}},
                },
            });
            res.send("your visits is booked successfully")
        }
       
    }catch (err){
        throw new  Error(err.message)
    }
 })

 //get all ookings of user

 export const getAllBookings = asyncHandler(async(req, res)=>{
     const {email} = req.body
     try{
        const bookings = await prisma.user.findUnique({
            where: {email},
            select: {bookedVisists: true}
        })
         res.status(200).send(bookings)
     }catch(err){
        throw new Error (err.message)
     }
 })

 //cancel a booking

 export const cancelBooking = asyncHandler(async(req, res)=>{

    const {email} = req.body;
    const {id} = req.params

    try {

        const user = await prisma.user.findUnique({
            where: {email: email},
            select: {bookedVisists: true}
        })

        const index = user.bookedVisists.findIndex((visit) => visit.id === id)
        
        if(index === -1){
            res.status(404).json({message: "Booking not found"})
        }else{
           user.bookedVisists.splice(index, 1)
           await prisma.user.update ({
            where:{email},
            data: {
                bookedVisists: user.bookedVisists
            }
           })
           res.send (" Booking cancelled successfully")
        }
    } catch (err) {
        throw new Error (err.message);
    }
 })

 // add a favourite list of a user


 export const toFav = asyncHandler(async(req, res)=>{
    const {email} = req.body
    const {rid} = req.params

    try {
      const user = await prisma.user.findUnique({
        where:{email}
      })  
       
      if (user.favResidenciesID.includes(rid)){
           const updateUser = await prisma.user.update({
            where: {email},
            data:{
                favResidenciesID:{
                    set: user.favResidenciesID.filter((id)=> id !== rid)
                }
            }
           });
           res.send({message: "Removed from favourites", user: updateUser})
      } else{
        const updateUser = await prisma.user.update({
            where: {email},
            data:{
                favResidenciesID:{
                    push: rid
                }
            }
        })
        res.send({message: "updated favourites", user: updateUser})
      }
    } catch (err)
     {
       throw new Error(err.message);  
    }
 })


 // get all favourites

 export const getAllFavourites= asyncHandler(async(req, res)=>{
   const {email} = req.body

   try {
      const favResd = await prisma.user.findUnique({
        where: {email},
        select:{favResidenciesID: true}
      }) 
       res.status(200).send(favResd)
   } catch (err)
   
   {
    throw new Error(err.message)
   }
 })