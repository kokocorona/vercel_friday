const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * פונקציה להעלאת קובץ מתיקייה מקומית למאגר GitHub
 * @param {string} localPath - נתיב מלא לקובץ במחשב/שרת
 * @param {string} githubPath - הנתיב והשם שיהיו לקובץ בתוך המאגר (למשל: 'images/pic.png')
 * @param {object} config - אובייקט הגדרות (token, owner, repo, branch)
 */
async function uploadFileToGitHub(localPath, githubPath, config) {
    const { token, owner, repo, branch = 'main' } = config;

    try {
        // 1. קריאת הקובץ והפיכה ל-Base64
        if (!fs.existsSync(localPath)) {
            throw new Error(`File not found at: ${localPath}`);
        }
        const fileBuffer = fs.readFileSync(localPath);
        const contentBase64 = fileBuffer.toString('base64');

        // 2. ניסיון לקבל SHA (למקרה שהקובץ כבר קיים ורוצים לעדכן)
        let sha;
        try {
            const getFile = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`,
                { 
                    params: { ref: branch },
                    headers: { Authorization: `Bearer ${token}` } 
                }
            );
            sha = getFile.data.sha;
        } catch (err) {
            // אם הקובץ לא קיים, נתעלם מהשגיאה ונמשיך ליצירה חדשה
        }

        // 3. שליחת הבקשה ל-GitHub (PUT משמש גם ליצירה וגם לעדכון)
        const response = await axios.put(
            `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`,
            {
                message: `Update/Upload file: ${path.basename(githubPath)}`,
                content: contentBase64,
                branch: branch,
                sha: sha // יישלח רק אם מצאנו SHA (עדכון קובץ קיים)
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
}