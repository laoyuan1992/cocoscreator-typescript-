//-------------------------------------------------------------------------------------------------
// 朋友场创建和加入界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase"
import EventName from "../../Common/Event/EventName"
import UIManager from "../../Common/UI/UIManager";
import {UIType} from "../../Common/UI/UIDefine"
const {ccclass, property} = cc._decorator;

@ccclass
export default class UICreateAndJoin extends UIBase 
{
    // 大的关闭按钮
    @property(cc.Button)
    BtnBGClose :cc.Button      = null;
    // 关闭按钮
    @property(cc.Button)
    BtnClose :cc.Button        = null;
    // 创建房间按钮
    @property(cc.Button)
    BtnCreateRoom : cc.Button  = null;
    // 加入按钮
    @property(cc.Button)
    BtnJoinRoom : cc.Button    = null;

    //关闭界面
    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIType.UI_CREATE_AND_JOIN);
    }

    //打开创建房间
    private OnClickCreateRoom()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_CREATE_ROOM);
        UIManager.DestroyUI(UIType.UI_CREATE_AND_JOIN);
    }

    //打开加入房间
    private OClickJoinRoom()
    {
        this.PlayButtonAudio();
        UIManager.ShowUI(UIType.UI_JOIN_ROOM);
        UIManager.DestroyUI(UIType.UI_CREATE_AND_JOIN);
    }
}