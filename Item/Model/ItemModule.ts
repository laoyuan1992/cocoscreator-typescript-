import Singleton from "../../Common/Function/Singleton";
import Dictionary from "../../Common/DataStruct/Dictionary";
import NetManager from "../../Common/Net/NetManager";
import EventName from "../../Common/Event/EventName";
//-------------------------------------------------------------------------------------------------
// 物品模块
//-------------------------------------------------------------------------------------------------
class ItemModule extends Singleton 
{
    private mItemTable = new Dictionary();

    public Init()
    {
        cc.systemEvent.on( EventName.NET_DO_ITEMLIST_REFRESH , this.DoRecvRefreshItemList , this );
        cc.systemEvent.on( EventName.NET_DO_ONLYITEM_REFRESH , this.DoRecvRefreshOnlyItem , this );
        cc.systemEvent.on( EventName.NET_DO_USEITEM_REFRESH  , this.DoRecvUseItem         , this ) ;               
    }

    //发送请求刷新物品
    public SendRefreshItem()
    {
        NetManager.SendMessage( EventName.NET_DO_ITEMLIST_REFRESH );
    }

    //使用道具
    public SendUseItem( SendMsg )
    {
        NetManager.SendMessage( EventName.NET_DO_USEITEM_REFRESH , SendMsg )
    }

    //接收背包数据
    private DoRecvRefreshItemList( Stream )
    {
        let CheckSum = Stream.detail.msg.ReadInt();
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgItemCont );
        this.mItemTable.Clear();
        this.RefreshItemList(  Msg.msg_item );
    }

    //接收背包单个道具信息
    private DoRecvRefreshOnlyItem( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgItemCont );
        this.RefreshItemList(  Msg.msg_item );
    }

    //接收使用道具
    private DoRecvUseItem( Stream )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = Stream.detail.msg.ReadProtoBuf( ProtoBuf.MsgUseItemUpdate );
        this.RefreshItemList(  Msg.item_info );
        this.RefreshItemList(  Msg.item_add );
        cc.systemEvent.emit( EventName.EVENT_UI_USEITEM , Msg )
    }

    //刷新道具列表
    private RefreshItemList( ItemList )
    {
        if( null == ItemList ) return;
        for( let i = 0 ; i < ItemList.length ; i++ )
        {
            let MsgItem = ItemList[i];
            this.mItemTable.Add( MsgItem.template_id , MsgItem );
        }
        //this.RequestItem( ItemList );
        //触发刷新背包
        cc.systemEvent.emit( EventName.EVENT_UI_ITEM_REFRESH );
    }

    //判断是否有某个道具
    public IsExist( ID ):boolean
    {
        let Item = this.mItemTable.GetItem(ID);
        if( Item == null ) return false;
        return true;
    }

    //删除某个道具
    public RemoveItem( ID )
    {
        this.mItemTable.Remove(ID);
    }

    //获取某个道具总个数
    public GetItemCount( ID ) :number
    {
        let Item = this.mItemTable.GetItem( ID );
        if( Item == null ) return 0;
        return Item.num;
    }

    //获得道具的列表
    public GetItemTable()
    {
        return this.mItemTable;
    }

}

export default ItemModule.GetInstance()
