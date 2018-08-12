import Singleton        from "../../Common/Function/Singleton";
import { OpenDataType } from "./OpenDataConfig";
import { WXRankType   } from "./OpenDataConfig";

class OpenDataModule extends Singleton {
    //显示好友排行
    public ShowFriendRank()
    {
        if(window["wx"] != undefined)
        {
            window["wx"].postMessage({
                messageType : OpenDataType.ShowFriendRank,
                RankType    : WXRankType.score
            });
        }
        else
        {
            console.log("ShowFriendRank")
        }
    }

    //显示群排行
    public ShowGroupFriendRank()
    {
        if(window["wx"] != undefined)
        {
            window["wx"].shareAppMessage({
                success : (res) =>{
                    if(res.shaTickets != undefined && res.shaTickets.length >0)
                    {
                        window["wx"].postMessage({
                            messageType : OpenDataType.ShowGroupFriendRank,
                            RankType    : WXRankType.score,
                            shareTicket : res.shareTickets[0]
                        });
                    }
                }
            }) 
        } 
        else
        {
            console.log("ShowGroupFriendRank");
        }   
    }

    //本地提交分数
    public SubmitRankScore(score:number)
    {
        if(window["wx"] != undefined)
        {
       
            window["wx"].postMessage({
                messageType : OpenDataType.SubmitRankScore,
                RankType    : WXRankType.score,
                Score       : score,
            });
        }
        else
        {
            console.log("SubmitRankScore");
        }
    }
}
export default OpenDataModule.GetInstance();
