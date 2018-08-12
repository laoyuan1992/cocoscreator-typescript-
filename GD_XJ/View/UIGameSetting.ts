import UIBase from "../../Common/UI/UIBase";
import SettingModule from "../../Setting/Model/SettingModule";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";
import AppFacade from "../../Framework/AppFacade";
import GuanDanScenes from "../Module/GuanDanScenes";

//-------------------------------------------------------------------------------------------------
// 游戏设置界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIGameSetting extends UIBase 
{
    @property(cc.Toggle)                              
    ToggleSoundEffect :cc.Toggle    = null;                    //音效开关
    @property(cc.Toggle)                              
    ToggleBGMusic :cc.Toggle        = null;                    //背景音乐开关
    @property(cc.Toggle)                              
    ToggleSingle :cc.Toggle         = null;                    //选择单张
    @property(cc.Toggle)                              
    ToggleColumn :cc.Toggle         = null;                    //选择整列

    start()
    {
        let Data = SettingModule.GetSetingData();
        this.ToggleSoundEffect.isChecked = Data.EffectState;
        this.ToggleBGMusic.isChecked = Data.BGSoundState;
        if(Data.GDSCway == 1)
        {
            this.ToggleSingle.isChecked = false;
            this.ToggleColumn.isChecked = true;
        }
        else
        {
            this.ToggleSingle.isChecked = true;
            this.ToggleColumn.isChecked = false;
        }
    }

    onDestroy()
    {
        SettingModule.SaveSetting();
    }


    //点击关闭
    private onClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_GAMESETTING.type);
    }

    //点击音效
    private OnClickSoundEffect( event )
    {
        this.PlayButtonAudio();
        SettingModule.SetEffectSoundState( event.isChecked );
    }

    //点击音乐
    private OnClickBGMusic( event )
    {
        this.PlayButtonAudio();
        SettingModule.SetBGSoundState( event.isChecked );
        if ( event.isChecked )
        {
            AppFacade.Instance.GetSoundManager().PlayGameBackGroundMusic( GameDefine.RoomType , "game"); 
        }
    }

    //点击单张
    private OnClickSingle()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SetSelectWay( GameDefine.GDSelectCardWay.SCW_SINGLE );
        SettingModule.SetGuanDanSelectCardWay( GameDefine.GDSelectCardWay.SCW_SINGLE );
    }

    //点击整列
    private OnClickColumn()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SetSelectWay( GameDefine.GDSelectCardWay.SCW_COLUMN );
        SettingModule.SetGuanDanSelectCardWay( GameDefine.GDSelectCardWay.SCW_COLUMN );
    }

}