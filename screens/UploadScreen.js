import React, { useState } from 'react';
import {
    View,
    SafeAreaView,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Alert,
    PermissionsAndroid,
    Image
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import storage from '@react-native-firebase/storage';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#bbded6'
    },
    selectButton: {
        borderRadius: 5,
        width: 150,
        height: 50,
        backgroundColor: '#8ac6d1',
        alignItems: 'center',
        justifyContent: 'center'
    },
    uploadButton: {
        borderRadius: 5,
        width: 150,
        height: 50,
        backgroundColor: '#ffb6b9',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    imageContainer: {
        marginTop: 30,
        marginBottom: 50,
        alignItems: 'center'
    },
    progressBarContainer: {
        marginTop: 20
    },
    imageBox: {
        width: 300,
        height: 300
    }
});

export default function UploadScreen() {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);

    const selectImage = () => {
        const options = {
            maxWidth: 2000,
            maxHeight: 2000,
            storageOptions: {
            skipBackup: true,
            path: 'images'
            }
        };
        
        ImagePicker.launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                const source = { uri: response.assets[0].uri };
                console.log(source);
                setImage(source);
            }
        });
      };
  
      const uploadImage = async () => {
        const { uri } = image;
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        setUploading(true);
        setTransferred(0);
        const task = storage().ref(filename).putFile(uploadUri);
        // set progress state
        task.on('state_changed', snapshot => {
            setTransferred(
                Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000
            );
        });
        try {
            await task;
        } catch (e) {
            console.error(e);
        }
        setUploading(false);
        Alert.alert(
            'Photo uploaded!',
            'Your photo has been uploaded to Firebase Cloud Storage!'
        );
        setImage(null);
      };

      requestCameraPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Camera permission given");
          } else {
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
      };
    
      // Launch Camera
      cameraLaunch = async () => {
        let options = {
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        };
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            ImagePicker.launchCamera(options, (res) => {
              console.log('Response = ', res);
    
              if (res.didCancel) {
                console.log('User cancelled image picker');
              } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
              } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
              } else {
                const source = { uri: res.uri };
                console.log('response', JSON.stringify(res));
                setImage({uri:res.assets[0].uri})
                // this.setState({
                //   filePath: res,
                //   fileData: res.data,
                //   fileUri: res.uri
                // });
              }
            });
          } else {
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
      }
    
      imageGalleryLaunch = () => {
        let options = {
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        };
    
        ImagePicker.launchImageLibrary(options, (res) => {
          console.log('Response = ', res);
    
          if (res.didCancel) {
            console.log('User cancelled image picker');
          } else if (res.error) {
            console.log('ImagePicker Error: ', res.error);
          } else if (res.customButton) {
            console.log('User tapped custom button: ', res.customButton);
            alert(res.customButton);
          } else {
            const source = { uri: res.uri };
            console.log('response', JSON.stringify(res));
            this.setState({
              filePath: res,
              fileData: res.data,
              fileUri: res.uri
            });
          }
        });
      }  
    
    return (
        <SafeAreaView style={styles.container}>
            <Text>{"\n"}</Text>
            <TouchableOpacity onPress={this.cameraLaunch} style={styles.selectButton}  >
              <Text style={styles.buttonText}>เปิดกล้อง</Text>
            </TouchableOpacity>
            <Text>{"\n"}</Text>
            <TouchableOpacity style={styles.selectButton} onPress={selectImage}>
                <Text style={styles.buttonText}>เลือกรูปภาพ</Text>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
            {image !== null ? (
                <Image source={{ uri: image.uri }} style={styles.imageBox} />
            ) : null}
            {uploading ? (
                <View style={styles.progressBarContainer}>
                    <Progress.Bar progress={transferred} width={300} />
                </View>
            ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
                    <Text style={styles.buttonText}>อัพโหลดรูปภาพ</Text>
                </TouchableOpacity>
            )}
            </View>
        </SafeAreaView>
    );
}
