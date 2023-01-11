const mongoose = require('mongoose');
const Schema = mongoose.Schema

// Interactions with the plagues collection
class Plagues {
    constructor(){
        // define the plague document schema
        this.schema = new Schema({
            name : {type: String, required:true},
            latin : {type: String, required:true},
            year : {type: Number, required:true},
            description : {type: String, required:true},
            classification : {
                type : {type: String, required:true},
                realm : {type: String, required:true},
                phylum : {type: String, required:true},
                order : {type: String, required:true},
                family : {type: String, required:true},
                subfamily : {type: String, required:true}
            }
        });

        // create the mongoose model from the schema
        this.model = mongoose.model("plagues", this.schema)
    }

    // find all plagues documents that match with the filter
    findAll(filter){                
        return this.model.find(filter)
    }

    // add a plague document
    insertOne(doc){
        return this.model.collection.insertOne(doc)
    }

    // add multiple plagues document
    insertMany(docs){
        return this.model.collection.insertMany(docs)
    }

    // update a plague document
    update(id, doc){
        return this.model.updateOne({_id:id}, doc)
    }

    // delete a plague document
    delete(id){
        return this.model.deleteOne({_id:id})
    }    

    findById(id){
        return this.model.findById(id)
    }
}

class Doctors {
    constructor(){
        this.schema = new Schema({
            firstname : {type: String, required:true},
            lastname : {type: String, required:true},
            speciality : {type: String, required:true},
            // add a location field
            location: { type: {type:String, required:true }, coordinates: [{type:Number, required:true }]}            
        });

        // add location index
        this.schema.index({ "location": "2dsphere" });

        this.model = mongoose.model("doctors", this.schema)
    }

    findAll(filter){        
        return this.model.find(filter)
    }

    insertOne(doc){
        return this.model.collection.insertOne(doc)
    }

    insertMany(docs){
        return this.model.collection.insertMany(docs)
    }

    update(id, doc){
        return this.model.updateOne({_id:id}, doc)
    }

    delete(id){
        return this.model.deleteOne({_id:id})
    }

    findById(id){
        return this.model.findById(id)
    }

    within(doctor, distance){
        return this.model.find({
            location:{
                '$near':{
                    $geometry: {type:"Point", coordinates: [doctor.location.coordinates[0], doctor.location.coordinates[1]]},
                    $maxDistance: distance
                  }
            },
            _id: { $ne:  doctor._id}
        })
    }

    nearest(actor, count){        
        return this.model.find({
            location:{
                '$near':{
                    $geometry: {type:"Point", coordinates: [actor.location.coordinates[0], actor.location.coordinates[1]]},
                    $maxDistance: 9999999999
                  },
                
            }
        }).limit(count)
    }
}


exports.Plagues = Plagues
exports.Doctors = Doctors