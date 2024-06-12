import * as base64Img from 'base64-img';
import * as fs from 'fs';
import * as imageSize from 'image-size';
import * as dotenv from 'dotenv';

dotenv.config();

interface Request {
  body: {
    photo: string;
  }
}

const uploadImage = (imageDir: string, req: Request) => {
  const images: string[] = [];
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }
  console.log(req.body);
  let image_type: string = req.body.photo.split(';')[0].split('/')[1];
  if (image_type === "jpeg") {
    image_type = "jpg";
  }
  const type: string[] = ['jpeg', 'png', 'jpg'];
  console.log(image_type);
  if (!type.includes(image_type)) {
    throw Error('Type is not valid');
  }

  let image_name = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 8; i++) {
    image_name += possible.charAt(
      Math.floor(Math.random() * possible.length),
    );
  }
  try {
    base64Img.img(
      req.body.photo,
      imageDir,
      image_name,
      (err: Error | null, filepath?: string) => {
        if (err) {
          console.log('profile image upload error ', err);
        } else {
          const resultImageName = `${image_name}.${image_type}`;

        }
      },
    );
    return `${image_name}.${image_type}`;
  } catch (error) {
    throw error;
  }
}

export {  uploadImage }
