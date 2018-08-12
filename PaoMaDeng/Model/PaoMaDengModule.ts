import Singleton from "../../Common/Function/Singleton";
import LinkedList from "../../Common/DataStruct/LinkedList";
import HttpUtils from "../../Common/Net/httpUtils";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import URLConfig from "../../Config/URLConfig";
import DynamicLoadModule from "../../Config/DynamicLoadModule";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import Util from "../../Utility/Util";

//========================================================= 
// 跑马灯模块
//=========================================================
class PaoMaDengInfo
{
    private mContent    : string    = "";
    private mView       : string    = "";
    private mStartTime  : number    = 0;
    private mCloseTime  : number    = 0;
    private mWaitTime   : number    = 0;

    //填充数据
    public FillPaoMaDengInfo( Param )
    {
        if( Param["text"]       != null ) { this.mContent   = Param["text"]         };
        if( Param["view"]       != null ) { this.mView      = Param["view"]         };
        if( Param["opentime"]   != null ) { this.mStartTime = Param["opentime"]     };
        if( Param["closetime"]  != null ) { this.mCloseTime = Param["closetime"]    };
        if( Param["waitime"]    != null ) { this.mWaitTime  = Param["waitime"]      };
    }

    public get Content()    : string { return this.mContent     };
    public get View()       : string { return this.mView        };
    public get StartTime()  : number { return this.mStartTime   };
    public get CloseTime()  : number { return this.mCloseTime   };
    public get WaitTime()   : number { return this.mWaitTime    };
}

class PaoMaDengModule extends Singleton 
{
    private mPaoMaDengList : LinkedList  = new LinkedList();
    private mHttpClient    : HttpUtils   = new HttpUtils();
    private mCurIndex     : number      = 0;

    //请求跑马灯信息
    public RequestPaoMaDeng()
    {
        let Count = this.mPaoMaDengList.GetCount();
        if( Count != 0 )
        {
            UIManager.ShowUI( UIType.UI_PAOMADENG );
            return;
        }

        let Url             = URLConfig.GetURLConfig( URLConfig.PaoMaDengModule );
        let ConfigModule    = DynamicLoadModule.DynamicLoadModuleType.LOAD_COMMON_MODULE;
        let ConfigKind      = DynamicLoadModule.DynamicLoadMatchKind.LOAD_COMMON_PAOMADENG_CONFIG;
        let CurTime         = Date.now();
        let Proxyid         = PlayerDataModule.GetProxyID();
        let Query           = "notuse";
        let SignParam       = "" + ConfigModule + ConfigKind + CurTime + Query + "jjconfigload.publish";
        SignParam           = Util.GetMD5( SignParam );
        let PostParam    : string   = "module="+ ConfigModule;
        PostParam += "&" + "kind="          + ConfigKind;
        PostParam += "&" + "time="          + CurTime;
        PostParam += "&" + "sql="           + Query;
        PostParam += "&" + "sig="           + SignParam;             
        this.mHttpClient.HttpPost( Url , PostParam, (this.CallBackPaoMaDeng.bind(this)) ); 
    }

    //请求跑马灯回调
    private CallBackPaoMaDeng( data )
    {
        if ( data == -1 ) return;
        var json = JSON.parse( data );
        if(json.length <= 0) return;
        this.mCurIndex = 0;
        this.mPaoMaDengList.Clear();

        let CurTime = Date.now();

        for( let i = 0 ; i < json.length ; i++ )
        {
            let PMDInfo = new PaoMaDengInfo();
            PMDInfo.FillPaoMaDengInfo(json[i]);
            if( PMDInfo.CloseTime > CurTime || PMDInfo.CloseTime == 0 )
            {
                this.mPaoMaDengList.Push( PMDInfo );
            }
        }

        //触发跑马灯
        if( this.mPaoMaDengList.GetCount() > 0 )
        {
            UIManager.ShowUI( UIType.UI_PAOMADENG );
        }
    }

    //检查超时跑马灯
    public TimeOutPaoMaDeng()
    {
        let CurrTime = Date.now();
        this.mPaoMaDengList.ForEach( (item : PaoMaDengInfo) => {
            if(item.CloseTime < CurrTime && item.CloseTime != 0 )
            {
                this.mPaoMaDengList.RemoveOneByValue( item );
            }
        } )
    }

    //获取跑马灯数据
    public GetData()
    {
        //检查超时时间
        this.TimeOutPaoMaDeng();

        //计算播放数据索引
        this.mCurIndex++;
        let TotalIndex = this.mPaoMaDengList.GetCount();
        if( 0 == TotalIndex ) return null;
        if( this.mCurIndex > TotalIndex )
        {
            this.mCurIndex = 1;
        }

        return this.mPaoMaDengList.Get( this.mCurIndex );
    }
}
export default PaoMaDengModule.GetInstance();