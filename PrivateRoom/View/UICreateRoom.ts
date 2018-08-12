import UIBase from "../../Common/UI/UIBase";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";

//-------------------------------------------------------------------------------------------------
// 创建房间界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
const CreateRoomClassPath :string = "Hall/Prefabs/CreateRoomMethod/";
@ccclass
export default class UICreateRoom extends UIBase 
{
    private mRoomType = "GD_XJ";
    //游戏玩法节点
    @property(cc.Node)
    RoomMethodParent :cc.Node      = null;
    start()
    {
        this.CreateRoomMethod();
    }

    //创建一个房间玩法
    public CreateRoomMethod()
    {
        let self = this;
        if( null == this.RoomMethodParent) return;
        let Path : string = CreateRoomClassPath + this.mRoomType;
        cc.loader.loadRes(Path, function (err, prefab) {
            if (err)
            {
                cc.log("---->>>>loadRes(GDRoomMethod)失败了！" + err.message);
            }
            else
            {
                let newNode = cc.instantiate(prefab);
                self.RoomMethodParent.addChild(newNode);
                newNode.setPositionX(0);
                newNode.setPositionY(0);
            }
        });
    }

    //点击关闭按钮
    private OnclickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIType.UI_CREATE_ROOM);
    }
}