import { QueryParams } from 'constants/query';
import PanelWrapper from 'container/PanelWrapper/PanelWrapper';
import { GetQueryResultsProps } from 'lib/dashboard/getQueryResults';
import getTimeString from 'lib/getTimeString';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { UseQueryResult } from 'react-query';
import { useDispatch } from 'react-redux';
import { UpdateTimeInterval } from 'store/actions';
import { SuccessResponse } from 'types/api';
import { Widgets } from 'types/api/dashboard/getAll';
import { MetricRangePayloadProps } from 'types/api/metrics/getQueryRange';

function WidgetGraph({
	selectedWidget,
	queryResponse,
	setRequestData,
}: WidgetGraphProps): JSX.Element {
	const graphRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();

	// const onDragSelect = useCallback(
	// 	(start: number, end: number): void => {
	// 		const startTimestamp = Math.trunc(start);
	// 		const endTimestamp = Math.trunc(end);
	// 		if (startTimestamp !== endTimestamp) {
	// 			dispatch(UpdateTimeInterval('custom', [startTimestamp, endTimestamp]));
	// 		}

	// 		const { maxTime, minTime } = GetMinMax('custom', [
	// 			startTimestamp,
	// 			endTimestamp,
	// 		]);

	// 		params.set(QueryParams.startTime, minTime.toString());
	// 		params.set(QueryParams.endTime, maxTime.toString());
	// 		const generatedUrl = `${location.pathname}?${params.toString()}`;
	// 		history.push(generatedUrl);
	// 	},
	// 	[dispatch, location.pathname, params],
	// );

	const handleBackNavigation = (): void => {
		const searchParams = new URLSearchParams(window.location.search);
		const startTime = searchParams.get(QueryParams.startTime);
		const endTime = searchParams.get(QueryParams.endTime);

		if (startTime && endTime && startTime !== endTime) {
			dispatch(
				UpdateTimeInterval('custom', [
					parseInt(getTimeString(startTime), 10),
					parseInt(getTimeString(endTime), 10),
				]),
			);
		}
	};

	useEffect(() => {
		window.addEventListener('popstate', handleBackNavigation);

		return (): void => {
			window.removeEventListener('popstate', handleBackNavigation);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div ref={graphRef} style={{ height: '100%' }}>
			<PanelWrapper
				widget={selectedWidget}
				queryResponse={queryResponse}
				setRequestData={setRequestData}
			/>
		</div>
	);
}

interface WidgetGraphProps {
	selectedWidget: Widgets;
	queryResponse: UseQueryResult<
		SuccessResponse<MetricRangePayloadProps, unknown>,
		Error
	>;
	setRequestData: Dispatch<SetStateAction<GetQueryResultsProps>>;
}

export default WidgetGraph;
