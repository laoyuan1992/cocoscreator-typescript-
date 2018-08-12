import UIBase from "../../Common/UI/UIBase";
import ChatModule from "../Module/ChatModule";
import ResourcesManager from "../../Framework/ResourcesManager";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";

//-------------------------------------------------------------------------------------------------
// 聊天表情
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIChatCell extends UIBase 
{
    @property(cc.Sprite)
    FaceImage: cc.Sprite = null;                   //表情图片

    @property(cc.Label)
    FaceName: cc.Label = null;                     //表情名字

    public Key : string = null;                 

    public Init(key,Value)
    {
        this.Key = key;
        this.FaceImage.spriteFrame = ResourcesManager.LoadSprite(Value["Atlas"],Value["Image"]);
        this.FaceName.string = Value["Name"];
    }

    private OnClickSendFace()
    {
        this.PlayButtonAudio();
        ChatModule.SendChatText(this.Key,0);
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_CHAT.type);
    }
}