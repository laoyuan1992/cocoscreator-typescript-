//-------------------------------------------------------------------------------------------------
// 商店界面
//-------------------------------------------------------------------------------------------------
import UIManager from "../../Common/UI/UIManager"
import * as UIDefines from "../../Common/UI/UIDefine" 
import UIBase from "../../Common/UI/UIBase";
import EventName from "../../Common/Event/EventName";
import ShopModule from "../Model/ShopModule";
import ItemModule from "../../Item/Model/ItemModule";
import Dictionary from "../../Common/DataStruct/Dictionary";
import ResourcesManager from "../../Framework/ResourcesManager";
import LinkedList from "../../Common/DataStruct/LinkedList";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIShop extends UIBase 
{
    @property(cc.Button)
    BtnClose: cc.Button         = null;
    @property(cc.Button)
    BGClose: cc.Button          = null;
    @property(cc.Node)
    ShopTypeGrid: cc.Node       = null;
    @property(cc.Node)
    ShopItemGrid: cc.Node       = null;
    @property(cc.Node)
    NullObj: cc.Node            = null;

    private mShopBtnCellList : LinkedList = new LinkedList();
    private mCurrkey         : number     = null;
    private mShopItemObjList: LinkedList  = new LinkedList();

    start() 
	{
        cc.systemEvent.on( EventName.EVENT_UI_SET_SHOPSELECTBUTTON  , this.NotifiRefreshShopSelect  , this );
        cc.systemEvent.on( EventName.EVENT_UI_REFRESH_SHOP          , this.NotifiRefreshShop        , this );
        ShopModule.LoadShopData();
    }
	
	onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_SET_SHOPSELECTBUTTON  , this.NotifiRefreshShopSelect  , this );
        cc.systemEvent.off( EventName.EVENT_UI_REFRESH_SHOP          , this.NotifiRefreshShop        , this );
        this.DeleteAllItem();    
    }

  

    //接受标签回调
    private NotifiRefreshShop() 
    {
        let MapShopInfo : Dictionary = ShopModule.GetShopKindTable();
        if( null == MapShopInfo || MapShopInfo.Size() <= 0 ) 
        {
            this.NullObj.active = true;
            return;
        }
        this.NullObj.active = false;
        MapShopInfo.ForEach( this.ForEachTable.bind(this) );
    }

    //遍历标签
    ForEachTable( key , value )
    {
        let Path = UIDefines.HallResPath.PrefabPath + "ShopTypeButtonCell";
        let Obj : cc.Node = ResourcesManager.LoadPrefab( Path , this.ShopTypeGrid );
        if( null == Obj ) return;
        let Cell = Obj.getComponent("UIShopButtonCell");
        Cell.RefreshData(value);
        this.mShopBtnCellList.Push( Cell );
        if( null == this.mCurrkey )
        {
            this.RefreshShopSelect( key );
        }
    }

    //刷新Item列表
    private RefreshShopItem( key )
    {
        if( this.mCurrkey == null ) return;
        if( this.mCurrkey != key  ) return;
        let Itemlist :LinkedList = ShopModule.GetItemList(key);
        if( null == Itemlist ) return;
        Itemlist.ForEach( (item) => {
            let Path = UIDefines.HallResPath.PrefabPath + "ShopItemCell";
            let Obj : cc.Node = ResourcesManager.LoadPrefab( Path ,this.ShopItemGrid );
            let Cell = Obj.getComponent("UIShopItemCell");
            this.mShopItemObjList.Push( Obj );
            Cell.RefreshData( item );
        } )
    }

    //刷新选择的页签列表
    private NotifiRefreshShopSelect( Message )
    {
        let key = Message.detail;
        if( key == this.mCurrkey ) return;
        this.DeleteAllItem();
        this.mCurrkey = key;
        this.RefreshSelect( key );
        this.RefreshShopItem( key )
    } 

    //刷新选择的页签列表
    private RefreshShopSelect( key )
    {
        if( key == this.mCurrkey ) return;
        this.DeleteAllItem();
        this.mCurrkey = key;
        this.RefreshSelect( key );
        this.RefreshShopItem( key )
    } 

    private RefreshSelect( key )
    {
        this.mShopBtnCellList.ForEach( (item) => {
            if( item == null ) return;
            item.SelectSprite( key );
        } )
    }

    //删除所有Item
    private DeleteAllItem()
    {
        this.mShopItemObjList.ForEach( (item : cc.Node) => {
            item.destroy();
        } )
        this.mShopItemObjList.Clear() ;
    }

    private ClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIDefines.UIType.UI_SHOP);
    }

}
