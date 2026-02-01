import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  ConfigProvider,
  theme,
  Switch,
  Card,
  Layout,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import {
  SunOutlined,
  MoonOutlined,
  GithubOutlined,
  VideoCameraOutlined,
  BgColorsOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import RectWithTransformer, {
  Rectangle,
} from "../components/RectWithTransformer";

const { Header, Content, Footer } = Layout;
const { Title, Text: AntText, Paragraph } = Typography;

const VideoRectDemo = () => {
  const [rects, setRects] = useState<Rectangle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Rectangle | null>(null);
  const [size, setSize] = useState({ width: 640, height: 360 });
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Mode for "fancy" feel
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const video = videoRef.current;
    if (video) {
      const onLoadedMetadata = () => {
        // Handle metadata
      };
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        document.head.removeChild(link);
      };
    }
  }, []);

  const addRect = () => {
    const newRect: Rectangle = {
      id: `rect-${Date.now()}`,
      x: size.width / 2 - 50,
      y: size.height / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      fill: "transparent",
      stroke: Konva.Util.getRandomColor(),
      strokeWidth: 2,
    };
    setRects([...rects, newRect]);
  };

  const checkDeselect = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      setDebugInfo(null);
    }
  };

  const scrollToEditor = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 8,
        },
      }}
    >
      <Layout
        style={{
          minHeight: "100vh",
          background: isDarkMode ? "#000" : "#fff",
        }}
      >
        {/* Header */}
        <Header
          style={{
            position: "fixed",
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: isDarkMode
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            borderBottom: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <VideoCameraOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title
              level={4}
              style={{ margin: 0, color: isDarkMode ? "#fff" : "#000" }}
            >
              VideoRect
            </Title>
          </div>
          <Space size='middle'>
            <Button
              type='text'
              icon={<GithubOutlined />}
              href='https://github.com/trae-ai/video-rect-demo'
              target='_blank'
            />
            <Switch
              checked={isDarkMode}
              onChange={setIsDarkMode}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
          </Space>
        </Header>

        {/* Hero Section */}
        <div
          style={{
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: isDarkMode
              ? "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)"
              : "radial-gradient(circle at center, #f0f2f5 0%, #fff 100%)",
            padding: "0 20px",
            marginTop: 64,
          }}
        >
          <Title
            style={{
              fontSize: "4rem",
              marginBottom: 16,
              background: "linear-gradient(45deg, #1890ff, #87d068)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Video Annotation Made Simple
          </Title>
          <Paragraph
            style={{
              fontSize: "1.5rem",
              maxWidth: 800,
              color: isDarkMode ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.45)",
            }}
          >
            A powerful, lightweight tool to annotate, label, and analyze video
            frames directly in your browser. No installation required.
          </Paragraph>
          <Space size='large' style={{ marginTop: 32 }}>
            <Button
              type='primary'
              size='large'
              shape='round'
              style={{ height: 48, padding: "0 32px", fontSize: 18 }}
              onClick={scrollToEditor}
            >
              Get Started
            </Button>
            <Button
              size='large'
              shape='round'
              style={{ height: 48, padding: "0 32px", fontSize: 18 }}
            >
              Learn More
            </Button>
          </Space>
        </div>

        {/* Editor Section */}
        <Content
          ref={scrollRef}
          style={{
            padding: "64px 24px",
            background: isDarkMode ? "#0a0a0a" : "#fafafa",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 48 }}>
              Workspace
            </Title>
            <Row gutter={[24, 24]}>
              {/* Toolbar */}
              <Col span={24}>
                <Card bordered={false} bodyStyle={{ padding: "12px 24px" }}>
                  <Space split={<Divider type='vertical' />}>
                    <Button
                      type='primary'
                      icon={<ControlOutlined />}
                      onClick={addRect}
                    >
                      Add Rectangle
                    </Button>
                    <AntText type='secondary'>
                      Tools: Select, Move, Rotate
                    </AntText>
                  </Space>
                </Card>
              </Col>

              {/* Video Stage */}
              <Col xs={24} lg={16}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
                    background: "#000",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: size.width,
                      height: size.height,
                    }}
                  >
                    <video
                      ref={videoRef}
                      src='https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      controls
                      autoPlay
                      muted
                      loop
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <Stage
                        width={size.width}
                        height={size.height}
                        onMouseDown={checkDeselect}
                        onTouchStart={checkDeselect}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <Layer>
                          {rects.map((rect, i) => (
                            <RectWithTransformer
                              key={rect.id}
                              shapeProps={rect}
                              isSelected={rect.id === selectedId}
                              onSelect={() => {
                                setSelectedId(rect.id);
                                setDebugInfo(rect);
                              }}
                              onDragMove={setDebugInfo}
                              onChange={(newAttrs: Rectangle) => {
                                const newRects = rects.slice();
                                newRects[i] = newAttrs;
                                setRects(newRects);
                                setDebugInfo(newAttrs);
                              }}
                            />
                          ))}
                        </Layer>
                      </Stage>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Properties Panel */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <Space>
                      <BgColorsOutlined />
                      <span>Properties</span>
                    </Space>
                  }
                  bordered={false}
                  style={{ height: "100%" }}
                >
                  {debugInfo ? (
                    <Space direction='vertical' style={{ width: "100%" }}>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Statistic
                            title='X Position'
                            value={debugInfo.x}
                            precision={2}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title='Y Position'
                            value={debugInfo.y}
                            precision={2}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title='Width'
                            value={debugInfo.width}
                            precision={0}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title='Height'
                            value={debugInfo.height}
                            precision={0}
                          />
                        </Col>
                        <Col span={24}>
                          <Statistic
                            title='Rotation'
                            value={debugInfo.rotation}
                            precision={2}
                            suffix='°'
                          />
                        </Col>
                      </Row>
                      <Divider />
                      <AntText type='secondary' style={{ fontSize: 12 }}>
                        ID: {debugInfo.id}
                      </AntText>
                    </Space>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "rgba(128,128,128,0.5)",
                      }}
                    >
                      <ControlOutlined
                        style={{ fontSize: 48, marginBottom: 16 }}
                      />
                      <Paragraph>
                        Select a rectangle to view properties
                      </Paragraph>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: "center",
            background: isDarkMode ? "#000" : "#f0f2f5",
            color: isDarkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
          }}
        >
          VideoRect Demo ©{new Date().getFullYear()} Created by Trae AI
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default VideoRectDemo;
