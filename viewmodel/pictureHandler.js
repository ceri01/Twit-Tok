import * as ImagePicker from 'expo-image-picker';
import {Image} from "react-native";
import DefaultImage from "../assets/favicon.png";
import ComunicationController from "../model/ComunicationController";
import UtilityStorageManager from "../model/UtilityStorageManager";
import database from "../model/DBManager";

export const openImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        base64: true
    });
    return result.assets[0].base64
};

export function createPictureSource(rawData) {
    if (rawData !== undefined && typeof(rawData) === "string" && rawData.length < 137000) {
        rawData.match(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/);
        return rawData;
    }

    return Image.resolveAssetSource(DefaultImage).uri
}

export function getUserPicture(uid, pversion) { // to be refactored
    let pic = null
    database().getUserPicture(uid, (result) => {
        if (result.length > 0) {
            if(result[0].pversion === pversion) {
                pic = result
            } else if (result.pversion !== pversion) {
                UtilityStorageManager.getSid().then((sid) => {
                    ComunicationController.getPicture(sid, uid).then((res) => {
                        database().updateUserPicture(uid, res.picture, res.pversion);
                        pic = res.picture;
                    });
                })
            }
        } else {
            UtilityStorageManager.getSid().then((sid) => {
                ComunicationController.getPicture(sid, uid).then((res) => {
                    if (res.picture === null) {
                        database().addUserPicture(res.uid, Image.resolveAssetSource(DefaultImage).uri, 0);
                        pic = Image.resolveAssetSource(DefaultImage).uri;
                    } else {
                        database().addUserPicture(res.uid, res.picture, res.pversion);
                        pic = res.picture;
                    }
                });
            })
        }
    })
    return createPictureSource(pic)
}
