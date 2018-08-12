import ItemPrototype from "../../Config/ItemPrototype";
import ResourcesManager from "../../Framework/ResourcesManager";
import * as UIDefines from "../../Common/UI/UIDefine"
import UIBase from "../../Common/UI/UIBase";
//-------------------------------------------------------------------------------------------------
// 背包Cell
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIBackPackItem extends UIBase {

    @property(cc.Label)
    Name: cc.Label = null;
    @property(cc.Label)
    Count: cc.Label = null;
    @property(cc.Sprite)
    ItemImage: cc.Sprite = null;

    private ItemData = null;

    public RefreshData( ItemData )
    {
        let StrName = ItemPrototype.GetCellData( ItemData.template_id ,2001003 );
        let ImageUrl = ItemPrototype.GetCellData( ItemData.template_id ,2001063 );
        let Atlas = ItemPrototype.GetCellData( ItemData.template_id ,2001244 );
        let CountNum =  ItemData.num;
        this.Name.string = StrName;
        this.Count.string = CountNum;
        this.ItemImage.spriteFrame = ResourcesManager.LoadSprite(  UIDefines.HallResPath.AltasPath + Atlas , ImageUrl )
        this.ItemData = ItemData;
    }

    private OnClickItem()
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit( "RF_DT" ,this.ItemData );
    }
}
