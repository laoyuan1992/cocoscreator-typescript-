import StringHelper from "./StringHelper"

export default class TimeHelper
{
    public static SecondsToString( Seconds : number ) : string
    {
        var StrContent = "00:01";

        var hour = Math.floor(Seconds / 3600) ;
        var min = Math.floor( (Seconds % 3600) / 60 );
        var sec = (Seconds % 3600) % 60;

        if ( hour > 0 )
        {
            StrContent = StringHelper.PadLeft(hour.toString(), 2, "0") + ":";
            StrContent += StringHelper.PadLeft(min.toString(), 2, "0") + ":";
            StrContent += StringHelper.PadLeft(sec.toString(), 2, "0");
        }
        else if ( min > 0 )
        {
            StrContent  = StringHelper.PadLeft(min.toString(), 2, "0") + ":";
            StrContent += StringHelper.PadLeft(sec.toString(), 2, "0") + "";
        }
        else if ( sec > 0 )
        {
            StrContent = "00:" + StringHelper.PadLeft(sec.toString(), 2, "0") + "";
        }
        return StrContent;
    }
    
    //转换时间
    public static getDateAndTimeText( time:number )
    {
        return this.getDateAndTimeTextByMS( time*1000 )     
    }

    //返回当前时间的标准时间格式
    public static getDateAndTimeTextByMS( timeMS:number) :string
    {
        let NewDate = new Date();
        NewDate.setTime(timeMS);
        return NewDate.toLocaleString()
       
    }
}
