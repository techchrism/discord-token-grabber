const level = require('level');
const os = require('os');
const path = require('path');

function getLevelDBPath()
{
    if(os.platform() === 'win32')
    {
        return path.join(process.env['APPDATA'], 'discord', 'Local Storage', 'leveldb');
    }
    else
    {
        throw new Error(`Unsupported platform: ${os.platform()}`);
    }
}

function getToken(levelDBPath)
{
    return new Promise((resolve, reject) =>
    {
        level(levelDBPath, {createIfMissing: false}, async (err, db) =>
        {
            if(err)
            {
                reject(err);
            }
            
            let startText = '';
            db.createReadStream().on('data', data =>
            {
                // Remove the smiley faces???
                if(startText === '' && data.key.startsWith('_'))
                {
                    startText = data.value[0];
                }
                
                const key = data.key.replace(startText, '');
                if(key.endsWith('token'))
                {
                    resolve(data.value.replace(startText, '').slice(1, -1));
                }
            }).on('error', err =>
            {
                reject(err);
            });
        });
    });
}

getToken(getLevelDBPath()).then(token =>
{
    console.log(token);
}).catch(err =>
{
    console.error('Error getting token:');
    console.error(err);
});
