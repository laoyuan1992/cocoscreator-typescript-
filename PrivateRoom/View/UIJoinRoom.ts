import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import LinkedList from "../../Common/DataStruct/LinkedList";
import UIBase from "../../Common/UI/UIBase";
import PrivateRoomModule from "../Model/PrivateRoomModule";

//-------------------------------------------------------------------------------------------------
// 朋友场加入界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIJoinRoom extends UIBase {
    //roomID对应的字符串
    private RoomIDStr : string       = "";
    //房间ID显示
    private TxtRoomIDList   = new Array();

    start()
    {
        this.InitTxtRoomID();
    }

    //初始化房间ID列表
    public InitTxtRoomID()
    {
        for (let i = 1; i < 7; i++) 
        {
            let txt:cc.Label = cc.find("Number/view/content/Text"+i,this.node).getComponent(cc.Label);
            this.TxtRoomIDList.push(txt);
        }
    }

    //点击关闭按钮
    private OnClickCloseBtn()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIType.UI_JOIN_ROOM)
    }

    //点击数字按钮
    private OnClickNumBerBtn(event,customEventData)
    {
        this.PlayButtonAudio();
        this.AppendRoomID( parseInt(customEventData));
    }

    //点击清空按钮
    private OnClickClearBtn()
    {
        this.ClearRoomIDText();
        this.RoomIDStr = "";
    }

    //点击删除按钮
    private OnClickDeleteBtn()
    {
        this.PlayButtonAudio();
        if(this.RoomIDStr.length == 0) return
        let Length = this.RoomIDStr.length;
        this.RoomIDStr = this.RoomIDStr.slice(0,Length-1)
        let txt = this.TxtRoomIDList[Length - 1];
        txt.string = "";
        this.RefreshRoomID();
    }

    //添加一个房间号
    AppendRoomID( Num : number )
    {
        if( Num < 0 || Num > 9 ) return;
        if(this.RoomIDStr.length >= 6) return;
        this.RoomIDStr += Num;
        if(this.RoomIDStr.length == 1)
        {
            this.ClearRoomIDText();
        }
        this.RefreshRoomID();
        if( this.RoomIDStr.length == 6 )
        {
            PrivateRoomModule.SendJoinRoom( parseInt( this.RoomIDStr ) );
        }
    }

    //刷新房间号显示
    RefreshRoomID()
    {
        let Len = this.RoomIDStr.length;
        for (let i = 1; i < Len + 1; i++) {
            let NumberStr = this.RoomIDStr.charAt(i-1)
            let TxtRoomID = this.TxtRoomIDList[i - 1];
            if(TxtRoomID != null)
            {
                TxtRoomID.string = NumberStr;
            }
        }
    }

    //清空房间号
    ClearRoomIDText()
    {
        this.TxtRoomIDList.forEach(
            function(txt)
            {
                txt.string = "";
            }
        )
    }


}
