import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
	R2_ACCOUNT_ID,
	R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY,
	R2_BUCKET_NAME,
	R2_PUBLIC_URL
} from '$env/static/private';

const s3Client = new S3Client({
	region: 'auto',
	endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY
	}
});

export function urlPublica(imageKey) {
	return imageKey ? `${R2_PUBLIC_URL}/${imageKey}` : null;
}

export async function subirImagen(imageKey, buffer, contentType) {
	await s3Client.send(
		new PutObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: imageKey,
			Body: buffer,
			ContentType: contentType
		})
	);
}

export async function eliminarImagen(imageKey) {
	await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: imageKey }));
}
