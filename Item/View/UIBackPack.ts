import UIBase from "../../Common/UI/UIBase";
import LinkedList from "../../Common/DataStruct/LinkedList";
import Dictionary from "../../Common/DataStruct/Dictionary";
import ItemModule from "../Model/ItemModule";
import ItemPrototype from "../../Config/ItemPrototype";
import ResourcesManager from "../../Framework/ResourcesManager";
import * as UIDefines from "../../Common/UI/UIDefine"
import UIBackPackItem from "./UIBackPackItem";
import UIManager from "../../Common/UI/UIManager";
//-------------------------------------------------------------------------------------------------
// 背包界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIItem extends UIBase {

    @property(cc.Node)
    Gird: cc.Node = null;
    @property(cc.Label)
    ItemDetail: cc.Label    = null;
    @property(cc.Label)
    ItemName: cc.Label  = null;
    @property(cc.Label)
    ItemCount: cc.Label = null;
    @property(cc.Sprite)
    ItemImage: cc.Sprite = null;

    private BackPackItemDataList : LinkedList = new LinkedList();

    start () 
    {
        cc.systemEvent.on( "RF_DT" , this.NotifiRefreshDetail , this );
        let ItemMap : Dictionary = ItemModule.GetItemTable();
        ItemMap.ForEach( (k , v) => {
            if( v != null)
            {
                let IsBackPackItem = ItemPrototype.GetCellData( v.template_id ,2001546 );
                if (IsBackPackItem)
                {
                    this.CreateOneItem( v );
                    this.BackPackItemDataList.Push(v);
                }
            }
        } )
        this.RefreshFirstDetail();
    }

    onDestroy()
    {
        cc.systemEvent.off( "RF_DT" , this.NotifiRefreshDetail , this );
    }

    //创建一个道具
    private CreateOneItem( ItemData )
    {
        let Obj : cc.Node = ResourcesManager.LoadPrefab( UIDefines.HallResPath.PrefabPath + "BackPackCell" , this.Gird );
        let Cell : UIBackPackItem = Obj.getComponent(UIBackPackItem);
        Cell.RefreshData( ItemData );
    }

    //刷新描述
    private RefreshDetail( ItemData )
    {
        let StrName = ItemPrototype.GetCellData( ItemData.template_id ,2001003 );
        let ImageUrl = ItemPrototype.GetCellData( ItemData.template_id ,2001063 );
        let Atlas = ItemPrototype.GetCellData( ItemData.template_id ,2001244 );
        let CountNum =  ItemData.num;
        let StrDetail = ItemPrototype.GetCellData( ItemData.template_id ,2001067 );
        this.ItemImage.spriteFrame = ResourcesManager.LoadSprite(  UIDefines.HallResPath.AltasPath + Atlas , ImageUrl );
        this.ItemName.string = StrName;
        this.ItemCount.string = CountNum;
        this.ItemDetail.string = StrDetail;
    }

    //刷新描述回调
    private NotifiRefreshDetail( Message )
    {
        let ItemData = Message.detail;
        this.RefreshDetail(ItemData);
    }

    //刷新第一个物品描述
    private RefreshFirstDetail()
    {
        let ItemData = this.BackPackItemDataList.Get(1);
        this.RefreshDetail(ItemData);
    }

    private OnClickClose()
    {
        UIManager.DestroyUI(UIDefines.UIType.UI_BACK_PACK);
    }
}
