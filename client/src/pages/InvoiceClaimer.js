import { useState } from "react";
import { Container } from "react-bootstrap";
import { Button } from "react-bootstrap";
import QrReader from "react-qr-scanner";
import Webcam from "react-webcam";
import React from "react";

function InvoiceClaimer(props) {
  const [claimOption, setClaimOption] = useState("");
  const webcamRef = React.useRef(null);
  const [result, setResult] = useState("");
  const [imgSrc, setImgSrc] = React.useState(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const handleScan = function (data) {
    setResult(data);
    // send data to api and verify its correct
    if (data) {
      window.location.replace("/");
    }
  };
  const handleError = function (err) {
    console.error(err);
  };
  const previewStyle = {
    height: 240,
    width: 320,
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const handlePictureVerified = () => {
    // send imgsrc to api
    // wait for response and do something depending on response from ml algorithm
    window.location.replace("/");
  };

  return (
    <Container>
      <div className="sign-form-container text-center">
        {claimOption === "" && (
          <>
            <h2>Choose claim option:</h2>
            <Button
              size="lg"
              className="mx-2"
              onClick={setClaimOption.bind(this, "fr")}
            >
              Facial Recognition
            </Button>
            <Button
              size="lg"
              className="mx-2"
              onClick={setClaimOption.bind(this, "qr")}
            >
              QR Code
            </Button>
          </>
        )}
        {claimOption === "qr" && (
          <>
            <h3>Scan QR Code</h3>
            <p className="lead">
              Scan the transaction QR code provided by the business
            </p>
            <QrReader
              delay={100}
              style={previewStyle}
              onError={handleError}
              onScan={handleScan}
            />
          </>
        )}
        {claimOption === "fr" && !imgSrc && (
          <>
            <h3>Take a Picture of Your Face</h3>
            <p className="lead">
              Make sure your picture is clear and shows your full face
            </p>
            <Webcam
              style={previewStyle}
              screenshotFormat="image/jpeg"
              audio={false}
              ref={webcamRef}
              videoConstraints={videoConstraints}
            />
            <Button onClick={capture}>Take Picture</Button>
          </>
        )}
        {claimOption === "fr" && imgSrc && (
          <>
            <h3>Verify Picture</h3>
            <p className="lead">Verify that your face is clearly shown</p>
            <img src={imgSrc} className="mb-3"></img>
            <Button onClick={handlePictureVerified}>Verify Picture</Button>
          </>
        )}
      </div>
    </Container>
  );
}
export default InvoiceClaimer;
