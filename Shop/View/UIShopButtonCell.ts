import EventName from "../../Common/Event/EventName";
import { ShopTable } from "../Model/ShopTable";
import UIBase from "../../Common/UI/UIBase";

//-------------------------------------------------------------------------------------------------
// 商店按钮
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIShopButtonCell extends UIBase
{
    @property(cc.Label)
    TextTitle: cc.Label         = null;
    @property(cc.Sprite)
    SpriteNormal: cc.Sprite     = null;
    @property(cc.Sprite)
    SpriteSelect: cc.Sprite     = null;

    private Data : ShopTable    = null;

    //刷新信息
    public RefreshData( Info : ShopTable )
    {
        this.Data = Info;
        this.TextTitle.string = Info.Name;
    }

    private ClickShopCell()
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit( EventName.EVENT_UI_SET_SHOPSELECTBUTTON ,this.Data.Order );
    }

    private SelectSprite( key )
    {
        if( key == this.Data.Order )
        {
            this.SpriteSelect.node.active = true;
            this.SpriteNormal.node.active = false;
        }
        else
        {
            this.SpriteSelect.node.active = false;
            this.SpriteNormal.node.active = true;
        }
    }
}
