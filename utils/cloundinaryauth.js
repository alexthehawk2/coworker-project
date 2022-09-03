const cloudinary = require('cloudinary')
cloudinary.config({ 
    cloud_name: 'alexthehawk', 
    api_key: '689199317793797', 
    api_secret: 'jXyBFTPzNzMsMCYE1s-rdJDkYOY' 
  });

module.exports.imageUpload = async(imageSource)=>{
    try {
        const result = await cloudinary.v2.uploader.upload(imageSource,{resource_type: "image",
    overwrite: true})
    return result.secure_url
    } catch (error) {
        console.log(error)
    }
    
}