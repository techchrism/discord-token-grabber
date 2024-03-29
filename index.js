const level = require('level');
const os = require('os');
const path = require('path');
const {argv} = require('yargs').option('leveldb', {
    alias: 'l',
    type: 'string',
    description: 'Path to the leveldb directory'
});

function getLevelDBPath()
{
    if(os.platform() === 'win32')
    {
        return path.join(process.env['APPDATA'], 'discord', 'Local Storage', 'leveldb');
    }
    else if (os.platform() === 'linux')
    {
        return path.join(process.env['HOME'], '.config', 'discord', 'Local Storage', 'leveldb');
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

getToken(argv['leveldb'] || getLevelDBPath()).then(token =>
{
    console.log(token);
}).catch(err =>
{
    console.error('Error getting token:');
    console.error(err);
});
