import Singleton from "../../Common/Function/Singleton";
import BoxDBManager from "../../Framework/BoxDBManager";
import SoundManager from "../../Sound/SoundManager";
import AppFacade from "../../Framework/AppFacade";

//-------------------------------------------------------------------------------------------------
// 设置模块
//-------------------------------------------------------------------------------------------------
class SettingData
{
    public EffectState   : boolean = true;
    public BGSoundState  : boolean = true;
    public EffectVolume  : number  = 1;
    public BGSoundVolume : number  = 1;
    public GDSCway       : number  = 0;
}

class SettingModule extends Singleton
{
    private SettingData : SettingData = null;

    //游戏启动设置属性
    public Init()
    {
        this.SettingData = BoxDBManager.GetItem("SettingData")
        if ( this.SettingData == null )
        {
            this.SettingData = new SettingData();
        }
    }

    //设置音效声音状态
    public SetEffectSoundState( State : boolean )
    {
        this.SettingData.EffectState = State;
        this.SaveSetting();
    }

    //设置背景声音状态
    public SetBGSoundState( State : boolean )
    {
        this.SettingData.BGSoundState = State;
        if( !State )
        {
            let SoundMgr = AppFacade.Instance.GetSoundManager();
            SoundMgr.StopBackGroundMusic();
        }
        this.SaveSetting();
    }

    //设置音效声音大小
    public SetEffectSoundVolume( Value : number )
    {
        this.SettingData.EffectVolume = Value;
        this.SaveSetting();
    }

    //设置背景声音大小
    public SetBGSoundVolume( Value : number )
    {
        this.SettingData.BGSoundVolume = Value;
        this.SaveSetting();
    }

    //保存当前设置
    public SaveSetting()
    {
        BoxDBManager.Push("SettingData" ,this.SettingData );
    }

    //获取设置
    public GetSetingData()
    {
        return this.SettingData;
    }

    //设置选牌方式
    public SetGuanDanSelectCardWay( scWay : number )
    {
        this.SettingData.GDSCway = scWay;
        this.SaveSetting();
    }

    // 获取选牌方式
    // 0 是单张 1 是整列，默认优先选择0
    public GetGuanDanSelectCardWay() : number
    {
        return this.SettingData.GDSCway;
    }
}
export default SettingModule.GetInstance();
