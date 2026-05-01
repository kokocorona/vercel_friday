const axios = require('axios');
const path = require('path');

// In-line Documentation
/**
 * פונקציה להעלאת Buffer (מידע בינארי) ישירות למאגר GitHub
 * @param {Buffer|ArrayBuffer} fileBuffer - המידע של הקובץ (למשל data שחזר מ-axios)
 * @param {string} githubPath - הנתיב והשם שיהיו לקובץ בתוך המאגר (למשל: 'images/pic.png')
 * @param {object} config - אובייקט הגדרות (token, owner, repo, branch)
 */
async function uploadBufferToGitHub(fileBuffer, githubPath, config) {
    const { token, owner, repo, branch = 'main' } = config;

    try {
        // 1. הפיכת ה-Buffer למחרוזת Base64 כפי ש-GitHub דורש
        // אנחנו משתמשים ב-Buffer.from כדי להבטיח שגם אם הגיע ArrayBuffer הוא יומר נכון
        const contentBase64 = Buffer.from(fileBuffer).toString('base64');

        // 2. בדיקה אם הקובץ קיים כדי לקבל SHA (נחוץ לצורך עדכון קובץ קיים)
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
            // אם הקובץ לא נמצא, נמשיך בלי SHA והוא פשוט ייווצר כחדש
        }

        // 3. העלאה/עדכון ב-GitHub
        const response = await axios.put(
            `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}`,
            {
                message: `Upload generated file: ${path.basename(githubPath)}`,
                content: contentBase64,
                branch: branch,
                sha: sha // יישלח רק אם קיים ערך (עדכון)
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
        // מחזיר את הודעת השגיאה המפורטת מה-API של GitHub במידה וקיימת
        throw error.response ? error.response.data : error;
    }
}

exports.uploadBufferToGitHub = uploadBufferToGitHub