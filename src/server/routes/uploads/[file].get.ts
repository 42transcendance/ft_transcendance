import fs from 'node:fs';
import path from 'node:path';
import { sendStream } from 'h3';

export default defineEventHandler((event) => {
	const fileName = getRouterParam(event, 'file');
	// to docker volume
	const filePath = path.join('/app/storage/uploads', fileName);

	if (fs.existsSync(filePath)) {
		// On définit le type de contenu (optionnel mais mieux)
		const ext = path.extname(fileName).toLowerCase();
		const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
		setResponseHeader(event, 'Content-Type', contentType);
		
		// On envoie le flux du fichier
		return sendStream(event, fs.createReadStream(filePath));
	}

	throw createError({ statusCode: 404, message: 'Fichier introuvable' });
});
