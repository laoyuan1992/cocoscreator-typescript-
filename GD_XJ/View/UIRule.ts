import UIBase from "../../Common/UI/UIBase";
import GameDefine from "../Module/GameDefine";
import UIManager from "../../Common/UI/UIManager";
//-------------------------------------------------------------------------------------------------
// 游戏设置界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIRule extends UIBase 
{
    @property(cc.Node)
    RoomMethodParent :cc.Node        = null;                  //帮助父节点

    private ContentList : Array<any> = new Array();           //帮助内容列表

    start()
    {
        this.RefreshGUI()
    }

    //刷新GUI
    private RefreshGUI()
    {
        let Content : string = GameDefine.Descript;
        this.AddContentInstanceToList(Content);
    }

    //根据分割内容添加实例到指定列表（文字内容）
    private AddContentInstanceToList( text :string )
    {
        let self = this;
        if(text == null) return;
        cc.loader.loadRes(GameDefine.PrefabPath + "LabelDescriptionCell", function (err, prefab) {
            if (err)
            {
                cc.log("---->>>>loadRes(LabelDescriptionCell)失败了！" + err.message);
            }
            else
            {
                if (prefab == null) return;
                let Cell : cc.Node = cc.instantiate(prefab);
                Cell.parent = self.RoomMethodParent;
                let Text : cc.Label =  Cell.getComponent(cc.Label);
                Text.string = text;
                self.ContentList.push(Cell);
            }
        });

    }

    //根据分割内容添加实例到指定列表( 牌面图案, 牌的状态, 特殊颜色 ）
    private AddContentSpriteInstanceToList( card , state , color ) 
    {
        
    }

    //获取麻将牌的正确父节点
    private GetParentTransform()
    {

    }

    //关闭界面
    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_RULE.type)
    }

}