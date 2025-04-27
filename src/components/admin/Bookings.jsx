import React, { useState, useEffect } from "react";
import { db } from "../../../backend/firebase/firebase.config";
import { app } from "../../../backend/firebase/firebase.config.js";
import {updateUserType,createAccountRequest,deleteAccount,} from "../../../backend/services/userServices";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {Pencil,Trash2,Filter,Search,UserPlus,ChevronDown} from "lucide-react";
import "./Bookings.css";

