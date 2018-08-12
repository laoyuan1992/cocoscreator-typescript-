//-------------------------------------------------------------------------------------------------
// 设置界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase";
import SettingModule from "../Model/SettingModule";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import MessageConfig from "../../Config/MessageConfig";
import SoundManager from "../../Sound/SoundManager";
import AppFacade from "../../Framework/AppFacade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISetting extends UIBase 
{
    @property(cc.Toggle)
    ToggleBGMusic: cc.Toggle     = null;
    @property(cc.Toggle)
    ToggleSoundEffect: cc.Toggle = null;
    @property(cc.Node)
    EffectOpen: cc.Node          = null;
    @property(cc.Node)
    EffectClose: cc.Node         = null;
    @property(cc.Node)
    MusicOpen: cc.Node           = null;
    @property(cc.Node)
    MusicClose: cc.Node          = null;

    onLoad() 
	{
	}

    start() 
	{
        this.RefreshDefaultUI();
    }

    update() 
	{
	}
	
	onDestroy()
    {
        SettingModule.SaveSetting();
    }

    private RefreshDefaultUI()
    {
        let SettingData   = SettingModule.GetSetingData();
        this.ToggleBGMusic.isChecked = SettingData.BGSoundState;
        this.MusicClose.active = !SettingData.BGSoundState;
        this.MusicOpen.active  = SettingData.BGSoundState;
        this.ToggleSoundEffect.isChecked = SettingData.EffectState;
        this.EffectClose.active = !SettingData.EffectState;
        this.EffectOpen.active  = SettingData.EffectState;
    }

    private ClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(  UIType.UI_SETTING );
    }

    private ClickBGMusic(t)
    {
        this.PlayButtonAudio();
        SettingModule.SetBGSoundState(t.isChecked);
        if (t.isChecked)
        {
            AppFacade.Instance.GetSoundManager().PlayBackGroundMusic("music_logo");
        }
        this.MusicClose.active = !t.isChecked;
        this.MusicOpen.active  = t.isChecked;
    }

    private ClickSoundEffect(t)
    {
        this.PlayButtonAudio();
        SettingModule.SetEffectSoundState(t.isChecked);
        this.EffectClose.active = ! t.isChecked;
        this.EffectOpen.active  = t.isChecked;
    }

    private ClickAbout()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_ABOUT_US);
        UIManager.DestroyUI(UIType.UI_SETTING);
    }

    private ClickUserPatch()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_USERPACT);   
        UIManager.DestroyUI(UIType.UI_SETTING);        
    }
}
