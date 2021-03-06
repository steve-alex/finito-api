import { NextFunction } from "connect";
import mongoose, { Schema, Document } from 'mongoose';
const validator = require('validator');
const bcrypt = require('bcrypt');
const Task = require("../models/task");

export interface IUser extends Document {
  _id: mongoose.ObjectId,
  name: string,
  email: string,
  age: number,
  password: string,
  tokens: string[]
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }, 
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value: string){
      if (!validator.isEmail(value)){
        throw new Error('Email is not valid');
      }
    }
  },
  password: {
    type: String,
    required: true,
    validate(value: string){
      if (value.length < 7){
        throw new Error('Password must be atleast 6 characters long');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value: number){
      if (value < 0){
        throw new Error()
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.virtual('areas', {
  ref: 'Area',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'owner'
})

//TODO - Understand how this works **PROPERLY**
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

userSchema.pre('save', async function(next: NextFunction) {
  const user = this;

  if (user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre('remove', async function(next: NextFunction) {
  const user = this;
  Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model<IUser>('User', userSchema); 

export default User;
