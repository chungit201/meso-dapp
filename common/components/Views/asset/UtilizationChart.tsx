import { isINT } from '@/utils';
import React from 'react';
import { Area, AreaChart, CartesianGrid, Dot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: any[];
  currentUtilization: number;
}

interface Props {
  asset: PoolAsset;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{ boxShadow: '0px 4px 16px 0px rgba(36, 88, 246, 0.20)' }}
        className="custom-tooltip bg-[#fff] p-4 rounded-[12px]"
      >
        <div>
          {payload.map((pld: any, index: number) => (
            <div key={index} style={{ display: 'inline-block', padding: 10 }}>
              <div style={{ color: pld.fill }}>
                <div className={'flex items-center gap-2'}>
                  <div className={'w-[12px] h-[12px] bg-[#2458F6] rounded-full'}></div>
                  <span className={'capitalize'}>{Object.keys(pld.payload)[0]}</span>:{' '}
                  {pld.payload.utilization.toFixed(2)}%
                </div>
                <div className={'flex items-center gap-2'}>
                  <div className={'w-[12px] h-[12px] bg-[#714DD9] rounded-full'}></div>
                  Variable borrow APR : {pld.payload.borrowRate.toFixed(isINT(pld.payload.borrowRate) ? 0 : 2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const UtilizationChart: React.FunctionComponent<Props> = ({ data, asset, currentUtilization }) => {
  const currentBorrowRate = asset.borrowApy;
  const CustomizedDot = ({ props, currentBorrowRate }: any) => {
    const { cx, cy, stroke, payload, value } = props;
    if (payload.utilization / 100 === currentUtilization) {
      return (
        <svg
          x={cx - 10}
          y={cy - 10}
          width={20}
          height={20}
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="6" fill="#714DD9" />
          <circle cx="11" cy="11" r="8.5" stroke="#C2ADFF" strokeOpacity="0.5" strokeWidth="5" />
        </svg>
      );
    }
  };

  function formatYAxis(value: number) {
    return `${value}%`;
  }

  return (
    <div className={'h-[250px] sm:h-[500px] mt-8'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            type={'number'}
            dataKey="utilization"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} />
          <Tooltip content={CustomTooltip} />
          <defs>
            <linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#634CD9" stopOpacity={1} />
              <stop offset="100%" stopColor="#634CD9" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B7A6FF" stopOpacity={1} />
              <stop offset="80%" stopColor="#B7A6FF" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Dot />
          <Area
            type="linear"
            dataKey="borrowRate"
            stroke={'#B7A6FF'}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#colorLight`}
            activeDot={false}
            dot={(props: any) => <CustomizedDot props={props} currentBorrowRate={currentBorrowRate} />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
