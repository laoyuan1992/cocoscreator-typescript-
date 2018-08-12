import Singleton from "../../Common/Function/Singleton";
import Dictionary from "../../Common/DataStruct/Dictionary";
import EventName from "../../Common/Event/EventName";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import NetManager from "../../Common/Net/NetManager";
//-------------------------------------------------------------------------------------------------
// 定位模块
//-------------------------------------------------------------------------------------------------

//角色定位信息
class LocationInfo 
{
    public x = 0;
    public y = 0;

    public IsValid()
    {
        if( this.x > 0 && this.y > 0 )
        {
            return true;
        }
        return false;
    }
}

class SLModule extends Singleton {
    
    private mMapTable : Dictionary = new Dictionary();

    //初始化
    public Init()
    {
        cc.systemEvent.on( EventName.NET_DO_REVC_ROLE_LOCATION ,this.RevcOtherRoleLocation , this );
    } 

    //开始定位
    private StartLocationService()
    {
        let PID = PlayerDataModule.GetPID();
        if( PID == null ) return;
        let PairItem = this.mMapTable.GetItem( PID );
        if( PairItem != null ) return;
        if( window["wx"] != null )
        {
            window["wx"].getLocation({
                type : 'wgs84 ',
                success : (res) =>
                {
                    let latitude = res.latitude;
                    let longitude = res.longitude;
                    this.SendSelfLocation( latitude , longitude );
                }
            })
        }
    }

    //同步定位信息
    private SendSelfLocation( latitude:number , longitude:number )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = new ProtoBuf.MsgUpdateValue();
        Msg.extdb_0 = latitude;
        Msg.extdb_1 = longitude;
        NetManager.SendMessage( EventName.NET_DO_SEND_ROLE_LOCATION , Msg );
    }

    //获取房间内玩家定位信息
    public SendOtherRoleLocation()
    {
        NetManager.SendMessage( EventName.NET_DO_REVC_ROLE_LOCATION );
    }

    //接受房间内玩家定位信息
    public RevcOtherRoleLocation( Message )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let msg = Message.detail.msg.ReadProtoBuf( ProtoBuf.MsgDistanceCount );
        for ( let i = 0 ; i < msg.distance_list.length ; i++ )
        {
            let MsgInfo = msg.distance_list[i];
            let CurLocation : LocationInfo = this.mMapTable.GetItem( MsgInfo.pid );
            if( CurLocation != null )
            {
                CurLocation.x = MsgInfo.distance_x;
                CurLocation.y = MsgInfo.distance_y;
            }
            else
            {
                CurLocation = new LocationInfo();
                CurLocation.x = MsgInfo.distance_x;
                CurLocation.y = MsgInfo.distance_y;
                this.mMapTable.Add( MsgInfo.pid , CurLocation );
            }
        }
        cc.systemEvent.emit( EventName.EVENT_UI_LOCATION );
    }

    //计算距离
    private Distance( sx , sy , tx , ty )
    {
        let rad_sx   = sx * Math.PI / 180.0;
        let rad_tx   = tx * Math.PI / 180.0;
        let rad_sy   = sy * Math.PI / 180.0;
        let rad_ty   = ty * Math.PI / 180.0;
        let dif_rad1 = rad_sx - rad_tx;
        let dif_ran2 = rad_sy - rad_ty;
        let dif = 2 * Math.asin( Math.sqrt( Math.pow( Math.sin( dif_rad1 / 2 ) , 2 ) + Math.cos( rad_sx ) * Math.cos(rad_tx) * Math.pow(Math.sin( dif_ran2 / 2 ) , 2 )));
        dif = dif * 6378137.0;
        dif = Math.ceil( dif * 10000) / 10000;
        return  Math.floor( dif );
    }

    //计算角色定理间隔距离
    public CalculationDistance( ID1 , ID2 )
    {
        let RoleA = this.mMapTable.GetItem( ID1 );
        if (RoleA == null || RoleA.IsValid() == false)
        {
            return null;
        } 
        let RoleB = this.mMapTable.GetItem( ID2 );
        if (RoleB == null || RoleB.IsValid() == false) 
        {
            return null;
        }
        return this.Distance( RoleA.x , RoleA.y , RoleB.x , RoleB.y );
    }
}

export default SLModule.GetInstance();
