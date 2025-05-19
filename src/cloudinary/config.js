import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dthieumo8'
  }
});

export default cld;

export const uploadPreset = 'dthieumo8_unsigned';


export const cloudinaryConfig = {
  cloudName: 'dthieumo8',
  apiKey: '972933727536317',
  uploadEndpoint: 'https://api.cloudinary.com/v1_1/dthieumo8/image/upload'
};