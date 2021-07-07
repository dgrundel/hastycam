import React from 'react';
import { ActionButton, Text, Stack, TextField, PrimaryButton, Spinner, DefaultButton, Slider, TooltipHost, Icon, DirectionalHint } from '@fluentui/react';
import { Feed } from 'hastycam.interface';
import { theme } from '../theme';
import { postJson } from '../fetch';
import { nanoid } from 'nanoid';

interface Props {
    feed: Feed;
    deleteFeed: (id: string) => void;
}

interface State {
    feed: Feed;
    editing: boolean;
    saving: boolean;
    error?: string;
}

export class FeedEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            feed: props.feed,
            editing: props.feed.name.length === 0,
            saving: false,
        };

        this.delete = this.delete.bind(this);
        this.edit = this.edit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.save = this.save.bind(this);
        this.setFeedData = this.setFeedData.bind(this);
    }

    delete() {
        this.props.deleteFeed(this.props.feed.id);
    }

    edit() {
        this.setState({ editing: true });
    }

    cancelEdit() {
        this.setState({ editing: false, error: undefined });
    }

    save() {
        this.setState({ saving: true, error: undefined });

        postJson<Feed>('http://localhost:4000/feed/', this.state.feed)
            .then(feed => {
                console.log('feed', feed);
                this.setState({ editing: false });
            })
            .catch((errs: any) => {
                if (Array.isArray(errs)) {
                    const err = errs.map(e => e.message).join(' ');
                    this.setState({ error: err });
                } else {
                    this.setState({ error: errs.toString() });
                }
            })
            .finally(() => this.setState({ saving: false }));
    }

    setFeedData(data: Partial<Feed>) {
        this.setState(prev => ({
            feed: {
                ...prev.feed,
                ...data,
            }
        }))
    }

    renderDataField(label: string, value?: string, tooltip?: string | JSX.Element) {
        if (!value) {
            return;
        }

        let labelElement = <Text style={{ color: theme.palette.neutralTertiary }}>
            {label} &nbsp;
        </Text>;
        
        if (tooltip) {
            const ttId = `tooltip-${nanoid(6)}`;
            labelElement = <div>
                <TooltipHost content={tooltip} id={ttId}>
                    <Text aria-describedby={ttId} style={{ color: theme.palette.neutralTertiary }}>
                        {label} <Icon iconName="Help" /> &nbsp;
                    </Text>
                </TooltipHost>
            </div>;
        }
        
        return <Stack>
            {labelElement}
            <Text>
                {value}
            </Text>
        </Stack>;
    }

    renderData() {
        return <Stack grow tokens={{ childrenGap: 's1', }}>
            {this.renderDataField('Feed name', this.state.feed.name)}
            {this.renderDataField('Stream URL', this.state.feed.streamUrl)}
            {this.renderDataField(
                'Max FPS', 
                this.state.feed.maxFps?.toString(),
                <span>
                    Set an upper bound for video frame rate.
                    Set lower to improve performance of video processing and viewing in browser.
                </span>
            )}
            {this.renderDataField(
                'Scale Factor', 
                this.state.feed.scaleFactor ? (this.state.feed.scaleFactor.toFixed(2) + 'x') : '',
                <span>
                    Scale the width and height of the video. 
                    Set lower to improve performance of video processing and viewing in browser.
                </span>
            )}
            {this.renderDataField(
                'Video quality', 
                this.state.feed.videoQuality ? this.state.feed.videoQuality.toString() : '',
                <span>Quality level of the video output. Range is 2-31 where <em>a lower number represents better quality</em>.</span>
            )}
        </Stack>;
    }

    renderForm() {
        return <Stack grow tokens={{ childrenGap: 's1', }}>
            <TextField
                label="Feed name"
                value={this.state.feed.name}
                onChange={(e, name) => { this.setFeedData({ name }) }}
            />
            <TextField
                label="Stream URL"
                value={this.state.feed.streamUrl}
                onChange={(e, streamUrl) => { this.setFeedData({ streamUrl }) }}
            />
            <Slider
                label="Max FPS"
                min={0}
                step={1}
                max={60}
                value={this.state.feed.maxFps || Feed.DEFAULT_MAX_FPS}
                showValue
                onChange={(maxFps) => { this.setFeedData({ maxFps }) }}
                valueFormat={(n) => n === 0 ? 'Unset' : n.toString()}
            />
            <Slider
                label="Scale factor"
                min={0}
                step={0.05}
                max={2}
                value={this.state.feed.scaleFactor}
                showValue
                onChange={(scaleFactor) => { this.setFeedData({ scaleFactor }) }}
                valueFormat={(n) => n === 0 ? 'Unset' : (n.toFixed(2) + 'x')}
            />
            <Slider
                label="Video quality"
                min={-31}
                step={1}
                max={-2}
                value={(this.state.feed.videoQuality ? this.state.feed.videoQuality : Feed.DEFAULT_VIDEO_QUALITY) * -1}
                showValue
                onChange={(videoQuality) => { this.setFeedData({ videoQuality: videoQuality * -1 }) }}
                valueFormat={(n) => (n * -1).toString()}
            />
        </Stack>;
    }

    renderEditButton() {
        if (this.state.editing) {
            if (this.state.saving) {
                return <Spinner label="Saving..." ariaLive="assertive" labelPosition="right" />;
            } else {
                return <Stack horizontal tokens={{ childrenGap: 's1', }}>
                    <PrimaryButton iconProps={{ iconName: 'DeviceFloppy' }} text="Save Feed" onClick={this.save}/>
                    <DefaultButton iconProps={{ iconName: 'X' }} text="Cancel" onClick={this.cancelEdit}/>
                </Stack>;
            }
        }

        return <ActionButton iconProps={{ iconName: 'Pencil' }} text="Edit Feed" onClick={this.edit}/>;
    }

    render() {
        return <div>
            <Stack tokens={{ childrenGap: 'm', }}>
                <Stack horizontal>
                    <Stack horizontal grow>
                        <Text variant="xLarge">{this.state.feed.name}</Text>
                    </Stack>
                    <Stack horizontal grow horizontalAlign="end">
                        <Text variant="small" style={{ color: theme.palette.neutralTertiary }}>id: {this.state.feed.id}</Text>
                    </Stack>
                </Stack>
                

                {this.state.error ? <Text block style={{ color: theme.palette.redDark }}>{this.state.error}</Text> : ''}
                
                <Stack horizontal tokens={{ childrenGap: 'm', }}>
                    {this.state.editing ? this.renderForm() : this.renderData()}

                    <img alt={this.state.feed.name} src={`http://localhost:4000/feed/still/${this.state.feed.id}`} style={{ maxWidth: '15vw', objectFit: 'contain' }}/>
                </Stack>
                
                <Stack horizontal>
                    <Stack horizontal grow>
                        {this.renderEditButton()}
                    </Stack>
                    <Stack horizontal grow horizontalAlign="end">
                        <ActionButton iconProps={{ iconName: 'Trash' }} text="Delete Feed" onClick={this.delete}/>
                    </Stack>
                </Stack>
            </Stack>
            
        </div>;
    }
}