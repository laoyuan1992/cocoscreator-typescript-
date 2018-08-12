import SettingModule from "../Setting/Model/SettingModule";

// 声音相关管理逻辑
// 
const {ccclass, property} = cc._decorator;

@ccclass
export default class SoundManager extends cc.Component
{

    private _BGMusicID = -1;         // 背景音乐的ID
    onLoad()
    {
        cc.log("SoundManager.onLoad");
    }

    start()
    {
        cc.log("SoundManger.star");
    }

    update(dt)
    {
    }

    onDestroy()
    {
        cc.log("SoundManger.onDestroy");
    }

    // Path需要提供扩展名，如：backgrounds/Hall.ogg

    //播放大厅背景音乐
    public PlayBackGroundMusic(Path : string)
    {
        if (Path.length == 0)
            return;
        let SettingData = SettingModule.GetSetingData();
        if ( SettingData.BGSoundState == false )
        {
            return;
        }
        this.StopBackGroundMusic();
        // 经测试，如果只填写相对路径调用会失败，使用raw返回的可以
        var raw_str = cc.url.raw("resources/Hall/Audio/backgrounds/" + Path + ".mp3");
        // 以后音量要改为从设置中取
        this._BGMusicID = cc.audioEngine.play(raw_str, true, 1);
    }

    //停止大厅背景音乐
    public StopBackGroundMusic()
    {
        if (this._BGMusicID >= 0)
        {
            cc.audioEngine.stop(this._BGMusicID);
            this._BGMusicID = -1;
        }
    }

    //播放大厅音效
    public PlaySoundEffect(Path : string)
    {
        if (Path.length == 0)
            return;
        let SettingData = SettingModule.GetSetingData();
        if ( SettingData.EffectState == false )
        {
            return;
        }
        var raw_str = cc.url.raw("resources/Hall/Audio/effects/" + Path + ".mp3");
        cc.audioEngine.play(raw_str, false, 1.0);
    }

    //播放游戏内背景音乐
    public PlayGameBackGroundMusic( GameType : string , Path : string)
    {
        if (Path.length == 0)
            return;
        let SettingData = SettingModule.GetSetingData();
        if ( SettingData.BGSoundState == false )
        {
            return;
        }
        this.StopBackGroundMusic();
        // 经测试，如果只填写相对路径调用会失败，使用raw返回的可以
        var raw_str = cc.url.raw("resources/"+ GameType + "/Audio/Backgrounds/" + Path + ".mp3");
        // 以后音量要改为从设置中取
        this._BGMusicID = cc.audioEngine.play(raw_str, true, 1);
    }

    //停止游戏内背景音乐
    public StopGameBackGroundMusic()
    {
        if (this._BGMusicID >= 0)
        {
            cc.audioEngine.stop(this._BGMusicID);
            this._BGMusicID = -1;
        }
    }

    //播放游戏内音效
    public PlayGameSoundEffect( GameType : string , Path : string)
    {
        if (Path.length == 0)
            return;
        let SettingData = SettingModule.GetSetingData();
        if ( SettingData.EffectState == false )
        {
            return;
        }
        var raw_str = cc.url.raw("resources/" + GameType + "/Audio/Effects/" + Path + ".mp3");
        cc.audioEngine.play(raw_str, false, 1.0);
    }
}
